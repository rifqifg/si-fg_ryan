import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from "@ioc:Adonis/Core/Validator";
import fs from "fs";
import XLSX from "xlsx";
import { HttpContext } from '@adonisjs/core/build/standalone';
import CreateManyRevenueValidator from '../../Validators/CreateManyRevenueValidator';
import { validator } from '@ioc:Adonis/Core/Validator'
import Account from '../../Models/Account';
import { RevenueStatus } from '../../lib/enums';
import Revenue from '../../Models/Revenue';
import { validate as uuidValidation } from "uuid"
import UpdateRevenueValidator from '../../Validators/UpdateRevenueValidator';

export default class RevenuesController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", mode = "page" } = request.qs();

    try {
      let data: Revenue[]
      if (mode === 'page') {
        data = await Revenue.query()
          .preload('account', qAccount => {
            qAccount.preload('student', qStudent => {
              qStudent.select('name')
            })
          })
          // .whereILike("account_name", `%${keyword}%`)
          // .if(account_no, (q) => q.where('number', account_no))
          .paginate(page, limit);
      } else {
        data = await Revenue.query().whereILike('account_name', `%${keyword}%`)
      }

      data.map(revenue => {
        if (revenue.account) {
          if (revenue.account.student) { revenue.account.owner = revenue.account.student.name }
          if (revenue.account.employee) { revenue.account.owner = revenue.account.employee.name }
        }

        return revenue
      })

      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "FRE-IND: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params;

    if (!uuidValidation(id)) {
      return response.badRequest({ message: "ID tidak valid" });
    }

    try {
      const data = await Revenue.query()
        .where('id', id)
        .preload('account', qAccount => {
          qAccount.preload('student', qStudent => {
            qStudent.select('name')
          })
        })
        .firstOrFail()

      if (data.account) {
        if (data.account.student) { data.account.owner = data.account.student.name }
        if (data.account.employee) { data.account.owner = data.account.employee.name }
      }

      response.ok({ message: "Data Berhasil Didapatkan", data })
    } catch (error) {
      response.badRequest({
        message: "FRE-IND: Gagal mengambil data",
        error: error.message,
      })
    }
  }

  public async update({ request, response }: HttpContextContract) {
    try {
      const payload = await request.validate(UpdateRevenueValidator))
      const data = await Revenue.updateOrCreateMany("id", payload.revenues)
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "FRE-UPD: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengubah data",
        error: message,
        error_data: error,
      });
    }
  }

  public async import({ request, response }: HttpContextContract) {

    const excelSchema = schema.create({ upload: schema.file({ extnames: ['xlsx', 'csv'] }) })

    let payload = await request.validate({ schema: excelSchema })

    const excelBuffer = fs.readFileSync(payload.upload.tmpPath?.toString()!);
    const jsonData = await RevenuesController.spreadsheetToJSON(excelBuffer)

    if (jsonData == 0) return response.badRequest({ message: "Data tidak boleh kosong" })

    const wrappedJson = { "revenues": jsonData }

    const manyRevenueValidator = new CreateManyRevenueValidator(HttpContext.get()!, wrappedJson)
    const payloadRevenue = await validator.validate(manyRevenueValidator)

    try {
      const data = await Revenue.createMany(payloadRevenue.revenues)

      response.created({ message: "Berhasil import data", data })
    } catch (error) {
      const message = "FRE-IMP: " + error.message || error;
      response.badRequest({
        message: "Gagal import data",
        error: message,
      })
    }
  }

  private static async spreadsheetToJSON(excelBuffer) {
    let workbook = await XLSX.read(excelBuffer)

    // Mendapatkan daftar nama sheet dalam workbook
    const sheetNames = workbook.SheetNames

    // membaca isi dari sheet pertama
    const firstSheet = workbook.Sheets[sheetNames[0]]
    const jsonData: Array<object> = XLSX.utils.sheet_to_json(firstSheet)

    if (jsonData.length < 1) return 0

    const formattedJson = await Promise.all(jsonData.map(async data => {
      // from chatgpt:
      // Subtracting 25569 from the serial number adjusts for the difference in the way Excel and JavaScript represent dates. In Excel, the date serial number is based on the number of days since January 1, 1900, while JavaScript uses January 1, 1970, as its reference point.
      // Multiplying by 86400 converts the serial number from days to seconds, as there are 86,400 seconds in a day.
      // Finally, multiplying by 1000 converts the seconds to milliseconds, which is the unit of time used by JavaScript's Date object.
      const jsDate = new Date((data["Tanggal"] - 25569) * 86400 * 1000)

      // from pak bani:
      // "Setiap transaksi dikenakan biaya Rp 3000.
      // Jadi data transaksi yg tersimpan di bsi (aka. dari excel) berkurang 3000.
      // Seharusnya yg tampil tetap, tidak dikurangi 3000."
      const fixedNominal = data["Nominal"] + 3000

      const noPembayaran = data["No Pembayaran"].toString()
      const account = await Account.query().where('number', noPembayaran).firstOrFail()

      return {
        from_account: account.id,
        time_received: jsDate,
        amount: fixedNominal,
        current_balance: fixedNominal,
        status: RevenueStatus.NEW,
        ref_no: data["Ref"]
      }
    }))

    return formattedJson
  }
}
