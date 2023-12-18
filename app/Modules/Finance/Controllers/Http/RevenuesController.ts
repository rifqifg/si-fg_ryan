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
import { DateTime } from 'luxon';
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist';
import { statusRoutes } from 'App/Modules/Log/lib/enum';
import AcademicYear from 'App/Modules/Academic/Models/AcademicYear';

export default class RevenuesController {
  public async index({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)

    const { page = 1, limit = 10, keyword = "", mode = "page" } = request.qs();

    const { academic_year_id } = request.qs();

    let academicYearBegin: string,
      academicYearEnd: string

    if (academic_year_id) {
      const academicYear = await AcademicYear.find(academic_year_id)

      if (academicYear) {
        [academicYearBegin, academicYearEnd] = academicYear.year.split(' - ')
      }
    }

    try {
      let data: Revenue[]
      if (mode === 'page') {
        data = await Revenue.query()
          .preload('account', qAccount => {
            qAccount.preload('student', qStudent => {
              qStudent.select('name')
            })
          })
          .if(academic_year_id, q => {
            q.andWhereBetween('time_received', [`${academicYearBegin}-07-01`, `${academicYearEnd}-06-30`])
          })
          .preload('transactions', qTransaction => qTransaction.preload('billings', qBilling => qBilling.pivotColumns(['amount'])))
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

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "FRE-IND: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)

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
        .preload('transactions', qTransaction => qTransaction.preload('billings', qBilling => qBilling.pivotColumns(['amount'])))
        .firstOrFail()

      if (data.account) {
        if (data.account.student) { data.account.owner = data.account.student.name }
        if (data.account.employee) { data.account.owner = data.account.employee.name }
      }

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Data Berhasil Didapatkan", data })
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message)
      response.badRequest({
        message: "FRE-IND: Gagal mengambil data",
        error: error.message,
      })
    }
  }

  public async update({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)

    try {
      const payload = await request.validate(UpdateRevenueValidator)
      const data = await Revenue.updateOrCreateMany("id", payload.revenues)
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "FRE-UPD: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengubah data",
        error: message,
        error_data: error,
      });
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)

    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "ID tidak valid" });
    }

    try {
      const data = await Revenue.findOrFail(id);
      await data.delete();

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      const message = "FBIL-DEL: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }

  public async report({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)

    const { academic_year_id } = request.qs();

    let academicYearBegin: string,
      academicYearEnd: string

    if (academic_year_id) {
      const academicYear = await AcademicYear.find(academic_year_id)

      if (academicYear) {
        [academicYearBegin, academicYearEnd] = academicYear.year.split(' - ')
      }
    }

    try {
      const revenues = await Revenue.query()
        .preload('account', qAccount => qAccount.select('number', 'account_name', 'type'))
        .if(academic_year_id, q => {
          q.andWhereBetween('time_received', [`${academicYearBegin}-07-01`, `${academicYearEnd}-06-30`])
        })
        .orderBy('time_received', 'asc')

      const data: any = {}

      revenues.forEach(revenue => {
        const month = revenue.timeReceived.toFormat("MMMM", { locale: 'id' })
        const year = revenue.timeReceived.year
        const group = `${month} ${year}`
        
        if (!data[group]) {
          data[group] = {}
          data[group].items = []
        }

        data[group].items.push(revenue)
      })

      // loop again to count subtotals and grand total
      let grandTotal = 0
      for (let monthYear in data) {
        const subTotal = data[monthYear].items.reduce((sum, next) => sum += next.amount, 0)

        data[monthYear].sub_total = subTotal
        grandTotal += subTotal
      }

      // don't forget to assign the grand total value
      data.grand_total = grandTotal

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      const message = "FRE-REP: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }

  }

  public async import({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)

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

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.created({ message: "Berhasil import data", data })
    } catch (error) {
      const message = "FRE-IMP: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
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

      // klo nggak ada kolom "No Pembayaran" isi dgn impossible value
      const noPembayaran = data["No Pembayaran"] ? data["No Pembayaran"].toString() : "-1"
      const account = await Account.query().where('number', noPembayaran).first()
      const accountId = account ? account.id : "-1" // there is no account id with negative value, right.. right?

      return {
        from_account: accountId,
        time_received: jsDate,
        current_balance: fixedNominal,
        amount: fixedNominal,
        status: RevenueStatus.NEW,
        ref_no: data["Ref"]
      }
    }))

    return formattedJson
  }
}
