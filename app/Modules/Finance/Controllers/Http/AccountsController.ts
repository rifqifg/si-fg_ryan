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
import GetLastAccountNoValidator from '../../Validators/GetLastAccountNoValidator';
import { BillingType } from '../../lib/enums';
import AcademicYear from 'App/Modules/Academic/Models/AcademicYear';

export default class AccountsController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", mode = "page", account_no } = request.qs();

    try {
      let data = {}
      if (mode === 'page') {
        data = await Account.query()
          .preload('student', qStudent => qStudent.select('name'))
          .whereILike("account_name", `%${keyword}%`)
          .if(account_no, (q) => q.where('number', account_no))
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
      const data = await Account.createMany(payload.accounts)
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

  // I might refactor this later....
  public async lastAccountNo({ request, response }: HttpContextContract) {
    let account, data

    const payload = await request.validate(GetLastAccountNoValidator)
    const academicYear = await AcademicYear.findByOrFail('active', true)
    const splitAcademicYear = academicYear.year.split(' ') // contoh: ['2022', '-', '2023']
    splitAcademicYear.splice(1, 1) // contoh: ['2022', '2023']

    // untuk kasus sekarang, ada dua format nomor rekening.
    // utk rekening bp, formatnya: 1 + (digit terakhir tahun akademik awal) + (digit terakhir tahun akademik akhir) + empat digit angka incremental
    // contoh 1: untuk tahun akademik 2022/2023, formatnya 1230001, 1230002, dst.
    // contoh 2: untuk tahun akademik 2015/2016, formatnya 1560001, 1560002, dst.

    // utk rekening spp, formatnya: (dua digit terakhir tahun akademik awal) + (dua digit terakhir tahun akademik akhir) + tiga digit angka incremental
    // contoh: untuk tahun akademik 2022/2023, formatnya 2223001, 2223002, dst.

    if (payload.type === BillingType.SPP) {
      // ambil DUA digit terakhir dari array splitAcademicYear, lalu join
      const sppAccNumberLeft = splitAcademicYear.map(element => element.slice(-2)).join('') // '2223'

      // lalu cari di db nomor rekening yg string depannya spt sppAccNumberLeft
      account = await Account.query()
        .whereILike("number", `${sppAccNumberLeft}%`)
        .orderBy('number', 'desc')
        .limit(1)

      // jika tidak ketemu, berarti belum ada data yg tersimpan dengan format 2223xxx.
      // langsung return '2223001'
      if (account.length <= 0) { data = sppAccNumberLeft.concat('001') }

      // jika ketemu, ambil TIGA digit terakhir nomor rekening tsb.
      const sppAccNumberRightRaw = account[0].number.slice(-3)

      // cast ke number, tambahkan dgn 1, lalu cast lagi ke string dengan leading zeros.
      // jumlah leading zero ditentukan parameter kedua fungsi formatNumberWithLeadingZeros
      const sppAccNumberRight = AccountsController.formatNumberWithLeadingZeros((+sppAccNumberRightRaw + 1).toString(), 3)

      data = `${sppAccNumberLeft}${sppAccNumberRight}`
    } else if (payload.type === BillingType.BP) {
      // ambil SATU digit terakhir dari array splitAcademicYear, lalu join
      const bpAccNumberLeft = splitAcademicYear.map(element => element.slice(-1)).join('') // '23'

      account = await Account.query()
        .whereILike("number", `1${bpAccNumberLeft}%`)
        .orderBy('number', 'desc')
        .limit(1)

      if (account.length <= 0) { data = bpAccNumberLeft.concat('0000') }

      // ambil EMPAT digit terakhir nomor rekening
      const bpAccNumberRightRaw = account[0].number.slice(-4)

      const bpAccNumberRight = AccountsController.formatNumberWithLeadingZeros((+bpAccNumberRightRaw + 1).toString(), 4)

      // jangan lupa leading 1 nya
      data = `1${bpAccNumberLeft}${bpAccNumberRight}`
    }

    const finalData = parseInt(data, 10)

    return response.ok({ "message": "berhasil mengambil data", data: finalData })
  }

  private static formatNumberWithLeadingZeros(number, width: number) {
    const numberStr = String(number);
    const zeroCount = Math.max(0, width - numberStr.length);
    const leadingZeros = '0'.repeat(zeroCount);
    return leadingZeros + numberStr;
  }
}
