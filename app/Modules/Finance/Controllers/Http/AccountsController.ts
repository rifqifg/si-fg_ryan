import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Account from '../../Models/Account';
import CreateAccountValidator from '../../Validators/CreateAccountValidator';
import { validate as uuidValidation } from "uuid";
import UpdateAccountValidator from '../../Validators/UpdateAccountValidator';
import UploadSpreadsheetAccountValidator from '../../Validators/UploadSpreadsheetAccountValidator';
import fs from "fs";
import XLSX from "xlsx";
import Student from 'App/Modules/Academic/Models/Student';
import GetLastAccountNoValidator from '../../Validators/GetLastAccountNoValidator';
import { BillingType } from '../../lib/enums';
import AcademicYear from 'App/Modules/Academic/Models/AcademicYear';
import { DateTime } from 'luxon';
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist';
import { statusRoutes } from 'App/Modules/Log/lib/enum';

export default class AccountsController {
  public async index({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { page = 1, limit = 10, keyword = "", tipe, mode = "page" } = request.qs();

    try {
      let data: Account[]
      if (mode === 'page') {
        data = await Account.query()
          .preload('student', qStudent => qStudent.select('name', 'nisn'))
          .where(query => {
            query.whereILike("number", `%${keyword}%`)
            query.orWhereHas('student', s => {
              s.whereILike('name', `%${keyword}%`)
                .orWhereILike('nisn', `%${keyword}%`)
            })
          })
          .if(tipe, qTipe => qTipe.andWhere('type', tipe))
          .paginate(page, limit);
      } else {
        data = await Account.query().whereILike('account_name', `%${keyword}%`)
      }

      data.map(account => {
        account.$extras.account_name = account.student.name
        account.$extras.nisn = account.student.nisn

        return account
      })

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "FAC-IND: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const payload = await request.validate(CreateAccountValidator)
    try {
      const data = await Account.createMany(payload.accounts)
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      const message = "FAC-STO: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      response.badRequest({
        message: "Gagal menyimpan data",
        error: message,
      })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)

    const { id } = params;
    if (!uuidValidation(id)) { return response.badRequest({ message: "ID tidak valid" }) }

    try {
      const data: Account = await Account.query()
        .where('id', id)
        .preload('student', qStudent => qStudent.select('name'))
        .preload('employee', qEmployee => qEmployee.select('name'))
        .firstOrFail()

      if(data.student) { data.owner = data.student.name }
      if(data.employee) { data.owner = data.employee.name }

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "FAC-SHO: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)

    const { id } = params;
    const payload = await request.validate(UpdateAccountValidator);
    if (JSON.stringify(payload) === "{}") {
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }

    try {
      const account = await Account.findOrFail(id);
      const data = await account.merge(payload).save();

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "FAC-UPD: " + error.message || error;
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
      const data = await Account.findOrFail(id);
      await data.delete();

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      const message = "FAC-DES: " + error.message || error;
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

    try {
      let academicYearBegin: string,
        academicYearEnd: string

      if (academic_year_id) {
        const academicYear = await AcademicYear.find(academic_year_id)

        if (academicYear) {
          [academicYearBegin, academicYearEnd] = academicYear.year.split(' - ')
        }
      }

      const accounts = await Account.query()
        .preload('revenues', qRevenue => {
          qRevenue
            .select('amount', 'time_received')
            .if(academic_year_id, q => {
              q.andWhereBetween('time_received', [`${academicYearBegin}-07-01`, `${academicYearEnd}-06-30`])
            })
            .orderBy('time_received', 'asc')
        })
        .preload('billings', qBilling => {
          qBilling
            .if(academic_year_id, q => {
              q.andWhereBetween('created_at', [`${academicYearBegin}-07-01`, `${academicYearEnd}-06-30`])
            })
            .whereHas('transactions', qTransaction => qTransaction.pivotColumns(['amount']))
            .preload('transactions', qTransaction => qTransaction.pivotColumns(['amount']))
        })

      const serializedAccounts = accounts.map(account => account.serialize())

      const data = serializedAccounts.map(account => {
        let reportBalance = 0

        if (account.revenues.length > 0) {
          reportBalance += account.revenues.reduce((sum, next) => sum += next.amount, 0)
        }

        // ingat bahwa billings ini pasti yg ada data transaksinya
        if (account.billings.length > 0) {
          account.billings.forEach(billing => {
            reportBalance -= billing.transactions.reduce((sum, next) => sum += next.amount, 0)
          })
        }

        account.report_balance = reportBalance

        return account
      })

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      const message = "FAC-REPORT: " + error.message || error;
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

    let payload = await request.validate(UploadSpreadsheetAccountValidator)

    try {
      const excelBuffer = fs.readFileSync(payload.upload.tmpPath?.toString()!);
      const jsonData = await AccountsController.spreadsheetToJSON(excelBuffer)

      if (jsonData.length < 1) return response.badRequest({ message: "Data tidak boleh kosong" })

      // Validasi nisn
      const nisns = jsonData.map(row => row.nisn)

      const existingStudents = await Student.query().whereIn('nisn', nisns)

      if (existingStudents.length !== jsonData.length) {
        const existingNisn = existingStudents.map(student => student.nisn)
        const notExistingStudents = jsonData.filter(row => !existingNisn.includes(row.nisn))

        const messages = notExistingStudents.map(notExist => ({
          item: `Siswa dengan nisn ${notExist.nisn} tidak ada di data akademik.`
        }))

        return response.badRequest({message: messages})
      }

      // masukkan id student ke data yg mau diimport, di variabel baru
      const jsonDataWithStudentId = jsonData.map(row => {
        const findStudent = existingStudents.find(s => s.nisn === row.nisn)
        let student_id = ''
        if (findStudent) {
          student_id = findStudent.id
        }

        return { student_id, ...row }
      })

      // Pisahkan tiap baris data berdasarkan no. rek.
      // misal nisn 23240001 punya rek. spp dan bp,
      // maka jadi dua row, 23240001 utk spp, dan 23240001 utk bp.
      // Kalo no. rek. nya null/undefined, skip
      // NOTE: consider refactor later
      const splittedJson: any[] = []
      jsonDataWithStudentId.forEach(row => {
        if (row.reference_spp !== undefined) {
          splittedJson.push({
            studentId: row.student_id,
            type: BillingType.SPP,
            number: row.va_spp,
            refAmount: row.reference_spp,
            balance: 0,
          })
        }

        if (row.reference_bwt !== undefined) {
          splittedJson.push({
            studentId: row.student_id,
            type: BillingType.BWT,
            number: row.va_bwt,
            refAmount: row.reference_bwt,
            balance: 0,
          })
        }

        if (row.reference_bp !== undefined) {
           splittedJson.push({
            studentId: row.student_id,
            type: BillingType.BP,
            number: row.va_bp,
            refAmount: row.reference_bp,
            balance: 0,
          })
        }
      })

      // jika ada data yg no. rek. nya udah exists, skip
      const existingAccountNumbers = (await Account.query().select('number', 'type')).map(account => `${account.number}_${account.type}`)
      const newAccounts = splittedJson.filter(row => {
        const combination = `${row.number}_${row.type}`
        return !existingAccountNumbers.includes(combination)
      })

      const data = await Account.createMany(newAccounts)

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.created({ message: "Berhasil import data", data })
    } catch (error) {
      const message = "FAC-IMP: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
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

    const jsonData: Array<object> = []
    sheetNames.forEach(sheet => {
      const sheetData: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], {raw: false})
      jsonData.push(...sheetData)
    });

    return jsonData.map(row => ({
      name: row["Nama"],
      nisn: row["NISN"],
      va_spp: row["No VA SPP"],
      va_bwt: row["No VA SPP"], // spp & bwt share satu no. rekening
      va_bp: row["No VA BP"],
      reference_spp: row["Acuan SPP"],
      reference_bwt: row["Acuan BWT"],
      reference_bp: row["Acuan BP"],
    }))
  }

  // I might refactor this later....
  public async lastAccountNo({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)

    let account, data

    try {
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
        if (account.length <= 0) {
          data = sppAccNumberLeft.concat('001')
        } else {
          // jika ketemu, ambil TIGA digit terakhir nomor rekening tsb.
          const sppAccNumberRightRaw = account[0].number.slice(-3)

          // cast ke number, tambahkan dgn 1, lalu cast lagi ke string dengan leading zeros.
          // jumlah leading zero ditentukan parameter kedua fungsi formatNumberWithLeadingZeros
          const sppAccNumberRight = AccountsController.formatNumberWithLeadingZeros((+sppAccNumberRightRaw + 1).toString(), 3)

          data = `${sppAccNumberLeft}${sppAccNumberRight}`
        }

      } else if (payload.type === BillingType.BP) {
        // ambil SATU digit terakhir dari array splitAcademicYear, lalu join
        const bpAccNumberLeft = splitAcademicYear.map(element => element.slice(-1)).join('') // '23'

        account = await Account.query()
          .whereILike("number", `1${bpAccNumberLeft}%`)
          .orderBy('number', 'desc')
          .limit(1)

        if (account.length <= 0) {
          data = `1${bpAccNumberLeft.concat('0001')}`
        } else {
          // ambil EMPAT digit terakhir nomor rekening
          const bpAccNumberRightRaw = account[0].number.slice(-4)

          const bpAccNumberRight = AccountsController.formatNumberWithLeadingZeros((+bpAccNumberRightRaw + 1).toString(), 4)

          // jangan lupa leading 1 nya
          data = `1${bpAccNumberLeft}${bpAccNumberRight}`
        }
      }

      const finalData = parseInt(data, 10)

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      return response.ok({ "message": "berhasil mengambil data", data: finalData })
    } catch (error) {
      const message = "FAC-LAN: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }

  private static formatNumberWithLeadingZeros(number, width: number) {
    const numberStr = String(number);
    const zeroCount = Math.max(0, width - numberStr.length);
    const leadingZeros = '0'.repeat(zeroCount);
    return leadingZeros + numberStr;
  }
}
