import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Billing from '../../Models/Billing';
import CreateBillingValidator from '../../Validators/CreateBillingValidator';
import { validate as uuidValidation } from "uuid";
import UpdateBillingValidator from '../../Validators/UpdateBillingValidator';
import UploadSpreadsheetBillingValidator from '../../Validators/UploadSpreadsheetBillingValidator';
import XLSX from "xlsx";
import fs from "fs";
import Account from '../../Models/Account';
import { validator } from '@ioc:Adonis/Core/Validator'
import { HttpContext } from '@adonisjs/core/build/standalone';

export default class BillingsController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", status, mode = "page", student_id } = request.qs();

    try {
      let data = {}
      if (mode === 'page') {
        data = await Billing.query()
          .if(student_id, q => q.whereHas('account', qAccount => qAccount.where('student_id', student_id)))
          .if(status, q => q.where('status', '=', status))
          .if(keyword, q => {
            q.andWhereHas('account', (a) => a.whereILike("number", `%${keyword}%`))
              .orWhereILike("name", `%${keyword}%`)
          })
          .preload('account', qAccount => qAccount.select('account_name', 'number', 'student_id'))
          .paginate(page, limit);
      } else {
        data = await Billing.query().whereILike('name', `%${keyword}%`)
      }

      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      const message = "FBIL-INDEX: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const billingValidator = new CreateBillingValidator(HttpContext.get()!, request.body())
    const payload = await request.validate(billingValidator)

    try {
      // set remaining_amount
      payload.billings.map(billing => {
        if (!billing.remaining_amount && billing.remaining_amount !== 0) {
          billing.remaining_amount = billing.amount
        }

        return billing
      })

      const data = await Billing.createMany(payload.billings)
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      const message = "FBIL-STORE: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal menyimpan data",
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
      const data = await Billing.query()
        .where('id', id)
        .preload('transactions')
        .preload('account', qAccount => qAccount.select('account_name', 'number'))
        .firstOrFail()

      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "FBIL-SHO: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async update({ request, response }: HttpContextContract) {
    try {
      const payload = await request.validate(UpdateBillingValidator)
      const data = await Billing.updateOrCreateMany("id", payload.billings)
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "FBIL-UPD: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengubah data",
        error: message,
        error_data: error,
      });
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "ID tidak valid" });
    }

    try {
      const data = await Billing.findOrFail(id);
      await data.delete();
      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      const message = "FBIL-DEL: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }

  public async import({ request, response }: HttpContextContract) {
    let payload = await request.validate(UploadSpreadsheetBillingValidator)

    const excelBuffer = fs.readFileSync(payload.upload.tmpPath?.toString()!);
    const jsonData = await BillingsController.spreadsheetToJSON(excelBuffer)

    if (jsonData == 0) return response.badRequest({ message: "Data tidak boleh kosong" })

    const manyBillingValidator = new CreateBillingValidator(HttpContext.get()!, jsonData)
    const payloadBilling = await validator.validate(manyBillingValidator)

    try {
      const data = await Billing.createMany(payloadBilling.billings)

      response.created({ message: "Berhasil import data", data })
    } catch (error) {
      const message = "FBIL-IMP: " + error.message || error;
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

    if (jsonData.length <= 1) return 0

    const formattedJson = await Promise.all(jsonData.map(async data => {
      const accountNo = data['Nomor Akun Tertagih'].toString()
      const amount = data['Jumlah'].toString()
      const type = data['Tipe'].toString().toLowerCase()

      const account = await Account.findByOrFail('number', accountNo)

      return {
        account_id: account.id,
        name: data['Nama Billing'],
        amount: amount,
        description: data['Deskripsi'],
        type: type,
      }
    }))

    return { "billings": formattedJson }
  }
}
