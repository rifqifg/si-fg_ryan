import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import fs from "fs";
import XLSX from "xlsx";
import { schema } from '@ioc:Adonis/Core/Validator'
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

    const { page = 1, limit = 10, keyword = "" } = request.qs();

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
      const data = await Revenue.query()
        .preload('account', qAccount => {
          qAccount.preload('student', qStudent => {
            qStudent.select('name')
          })
        })
        .if(academic_year_id, q => {
          q.andWhereBetween('time_received', [`${academicYearBegin}-07-01`, `${academicYearEnd}-06-30`])
        })
        .whereHas('account', q => q.whereILike('account_name', `%${keyword}%`))
        .preload('transactions', qTransaction => qTransaction.preload('billings', qBilling => qBilling.pivotColumns(['amount'])))
        .paginate(page, limit);

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

    try {
      const excelBuffer = fs.readFileSync(payload.upload.tmpPath?.toString()!);
      const jsonData = await RevenuesController.spreadsheetToJSON(excelBuffer)

      if (jsonData == 0) return response.badRequest({ message: "Data tidak boleh kosong" })

      // cek duplikat revenue, by no. referensi
      const duplicateRevenue = await Revenue.query()
        .whereIn('ref_no', jsonData.map(revenue => revenue.ref_no))
      if (duplicateRevenue.length > 0) {
        const errors = duplicateRevenue.map(revenue => ({
          item: `Data dengan No. Referensi ${revenue.refNo} sudah ada di database`
        }))
        return response.badRequest({ message: errors })
      }

      // filter duplikat no. rek.
      const uniqueJsonData = this.filterUniqueAccountNumber(jsonData)

      // cek apakah no. rekening sudah ada utk revenue yg akan diimport...
      const existingAccounts = await Account.query()
        .whereIn('number', uniqueJsonData.map(revenue => revenue.account_number))
      const existingAccountNo = existingAccounts.map(ea => ea.number)
      const newAccounts = uniqueJsonData.filter(revenue => {
        return !existingAccountNo.includes(revenue.account_number)
      })

      // TODO: set jenis rekening by format no. rek.

      // ...jika no rek. belum exist, dibikin dlu
      if (newAccounts.length > 0) {
        await Account.createMany(newAccounts.map(newAcc => ({
          accountName: newAcc.name,
          number: newAcc.account_number,
          balance: 0,
        })))
      }

      // masukkan id account ke array jsonData..
      // .. sebelum itu, karena ada account baru, maka select account lagi
      const accounts = await Account.query()
        .whereIn('number', uniqueJsonData.map(revenue => revenue.account_number))

      const jsonDataWithAccountId = jsonData.map(revenue => {
        const match = accounts.find(a => a.number === revenue.account_number)
        return {...revenue, accountId: match!.id}
      })

      const data = await Revenue.createMany(jsonDataWithAccountId.map(revenue => ({
        refNo: revenue.ref_no,
        fromAccount: revenue.accountId,
        amount: revenue.amount,
        currentBalance: revenue.current_balance,
        invoiceAmount: revenue.invoice_amount,
        invoiceNumber: revenue.invoice_number,
        timeReceived: revenue.time_received,
        status: RevenueStatus.NEW
      })))

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.created({ message: "Berhasil import data", data })
    } catch (error) {
      const message = "FRE-IMP: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      response.badRequest({
        message: "Gagal import data",
        error: message,
        error_data: error
      })
    }
  }

  // hanya ambil objek dgn no. rek unik
  private filterUniqueAccountNumber(arr) {
    let unique = new Set()
    return arr.filter(obj => {
      if (!unique.has(obj.account_number)) {
        unique.add(obj.account_number)
        return true
      }
      return false
    })
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
      // konversi tanggal excel ke js
      const jsDate = new Date((data["Tanggal"] - 25569) * 86400 * 1000)

      // pembulatan biaya admin BSI, jika nominal transfer tidak 0
      const fixedNominal = (data["Nominal dibayar"] === 0) ? data["Nominal dibayar"] : data["Nominal dibayar"] + 3000

      // TODO: hapus kolom yg bukan dari excel
      // TODO: get NISN
      return {
        name: data["Nama"],
        account_number: data["No Pembayaran"].toString(),
        invoice_number: data["No Invoice"],
        invoice_amount: data["Nominal Invoice"],
        time_received: DateTime.fromJSDate(jsDate),
        current_balance: fixedNominal,
        amount: fixedNominal,
        status: RevenueStatus.NEW,
        ref_no: data["Ref"]
      }
    }))

    return formattedJson
  }
}
