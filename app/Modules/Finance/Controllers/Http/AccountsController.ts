import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Account from '../../Models/Account';
import CreateAccountValidator from '../../Validators/CreateAccountValidator';
import { validate as uuidValidation } from "uuid";
import UpdateAccountValidator from '../../Validators/UpdateAccountValidator';
import UploadSpreadsheetAccountValidator from '../../Validators/UploadSpreadsheetAccountValidator';
import fs from "fs";
import XLSX from "xlsx";
import Student from 'App/Modules/Academic/Models/Student';
import CreateManyAccountValidator from '../../Validators/CreateManyAccountValidator';
import { HttpContext } from '@adonisjs/core/build/standalone';
import { validator } from '@ioc:Adonis/Core/Validator'

export default class AccountsController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", mode = "page" } = request.qs();

    try {
      let data = {}
      if (mode === 'page') {
        data = await Account.query()
          .preload('student', qStudent => qStudent.select('name'))
          .whereILike("account_name", `%${keyword}%`)
          .paginate(page, limit);
      } else {
        data = await Account.query().whereILike('account_name', `%${keyword}%`)
      }

      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "FAC-IND: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateAccountValidator)
    try {
      const data = await Account.create(payload)
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      const message = "FAC-STO: " + error.message || error;
      response.badRequest({
        message: "Gagal menyimpan data",
        error: message,
      })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) { return response.badRequest({ message: "ID tidak valid" }) }

    try {
      const data = await Account.findOrFail(id)
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "FAC-SHO: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params;
    const payload = await request.validate(UpdateAccountValidator);
    if (JSON.stringify(payload) === "{}") {
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }

    try {
      const account = await Account.findOrFail(id);
      const data = await account.merge(payload).save();
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "FAC-UPD: " + error.message || error;
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
      const data = await Account.findOrFail(id);
      await data.delete();
      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      const message = "FAC-DES: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }

  public async import({ request, response }: HttpContextContract) {
    let payload = await request.validate(UploadSpreadsheetAccountValidator)

    const excelBuffer = fs.readFileSync(payload.upload.tmpPath?.toString()!);
    const jsonData = await AccountsController.spreadsheetToJSON(excelBuffer)

    if (jsonData == 0) return response.badRequest({ message: "Data tidak boleh kosong" })

    const wrappedJson = { "accounts": jsonData }
    const manyAccountValidator = new CreateManyAccountValidator(HttpContext.get()!, wrappedJson)
    const payloadAccount = await validator.validate(manyAccountValidator)

    try {
      const data = await Account.createMany(payloadAccount.accounts)

      response.created({ message: "Berhasil import data", data })
    } catch (error) {
      const message = "FAC-IMP: " + error.message || error;
      response.badRequest({
        message: "Gagal import data",
        error: message,
      })
    }
  }

  // helper function utk import excel + convert ke json
  private static async spreadsheetToJSON(excelBuffer) {
    let workbook = await XLSX.read(excelBuffer)

    // Mendapatkan daftar nama sheet dalam workbook
    const sheetNames = workbook.SheetNames

    // membaca isi dari sheet pertama
    const firstSheet = workbook.Sheets[sheetNames[0]]
    const jsonData: Array<object> = XLSX.utils.sheet_to_json(firstSheet)

    if (jsonData.length <= 1) return 0

    // Warning: async call didalam loop (map)
    // might refactor later
    const formattedJson = await Promise.all(jsonData.map(async data => {
      const nisSiswa = data["NIS"]?.toString()

      const student = await Student.query()
        .where('nis', '=', nisSiswa)
        .firstOrFail()
      const accountName = `Rekening ${data['Jenis Akun']} ${student.name}`
      const balance = data["Saldo"] ? data["Saldo"].toString() : "0"

      return {
        coa_id: data['Nomor COA']?.toString(),
        student_id: student.id,
        account_name: accountName,
        balance: balance,
        number: data['Nomor Rekening']?.toString()
      }
    }))

    return formattedJson
  }
}
