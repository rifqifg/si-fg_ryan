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
import { BillingStatus, BillingType } from '../../lib/enums';
import { DateTime } from 'luxon';
import AcademicYear from 'App/Modules/Academic/Models/AcademicYear';
import Student from 'App/Modules/Academic/Models/Student';

export default class BillingsController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", status, mode = "page", student_id, academic_year_id } = request.qs();

    try {
      let academicYearBegin: string,
        academicYearEnd: string

      if (academic_year_id) {
        const academicYear = await AcademicYear.find(academic_year_id)

        if (academicYear) {
          [academicYearBegin, academicYearEnd] = academicYear.year.split(' - ')
        }
      }

      let data: Billing[]
      if (mode === 'page') {
        data = await Billing.query()
          .if(student_id, q => q.whereHas('account', qAccount => qAccount.where('student_id', student_id)))
          .if(status, q => q.where('status', '=', status))
          .if(keyword, q => {
            q.andWhere(qWhere => {
              qWhere.andWhereHas('account', (a) => a.whereILike("number", `%${keyword}%`))
              qWhere.orWhereHas('account', (a) => a.whereILike("account_name", `%${keyword}%`))
            })
          })
          .if(academic_year_id, q => {
            q.andWhereBetween('due_date', [`${academicYearBegin}-07-01`, `${academicYearEnd}-06-01`])
          })
          .preload('account', qAccount => qAccount.select('account_name', 'number', 'student_id'))
          .orderBy('due_date', 'asc')
          .paginate(page, limit);
      } else {
        data = await Billing.query().whereILike('name', `%${keyword}%`)
      }

      // TODO: refactor, gabungin query related transactions ke query atas
      await Promise.all(data.map(async billing => {
        const relatedTransaction = await billing.related('transactions').query().pivotColumns(['amount'])
        const totalPaid = relatedTransaction.reduce((sum, current) => sum + current.$extras.pivot_amount, 0)

        billing.$extras.remaining_amount = billing.amount - totalPaid

        if (billing.$extras.remaining_amount > 0) billing.$extras.status = BillingStatus.PAID_PARTIAL
        if (billing.$extras.remaining_amount === billing.amount) billing.$extras.status = BillingStatus.UNPAID
        if (billing.$extras.remaining_amount <= 0) billing.$extras.status = BillingStatus.PAID_FULL
      }))

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
      const billing = await Billing.findOrFail(id)
      const relatedTransaction = await billing.related('transactions').query().pivotColumns(['amount']).preload('revenue', q => q.preload('account'))
      const totalPaid = relatedTransaction.reduce((sum, current) => sum + current.$extras.pivot_amount, 0)
      billing.$extras.remaining_amount = billing.amount - totalPaid

      if (billing.$extras.remaining_amount > 0) billing.$extras.status = BillingStatus.PAID_PARTIAL
      if (billing.$extras.remaining_amount === billing.amount) billing.$extras.status = BillingStatus.UNPAID
      if (billing.$extras.remaining_amount <= 0) billing.$extras.status = BillingStatus.PAID_FULL

      response.ok({ message: "Berhasil mengambil data", data: { ...billing.$attributes, ...billing.$extras, related_transaction: relatedTransaction } });
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

    if (jsonData.length < 1) return 0

    const formattedJson = await Promise.all(jsonData.map(async data => {
      const accountNo = data['Nomor Akun Tertagih'].toString()
      const amount = data['Jumlah'].toString()
      const type = data['Tipe'].toString().toLowerCase()
      const dueDate = DateTime.fromFormat(data['Jatuh Tempo'], 'dd/MM/yyyy')

      const account = await Account.findBy('number', accountNo)
      const accountNumber = account ? account.id : "-1"

      return {
        account_id: accountNumber,
        name: data['Nama Billing'],
        amount: amount,
        description: data['Deskripsi'],
        due_date: dueDate,
        type: type,
      }
    }))

    return { "billings": formattedJson }
  }

  public async recapBilling({ params, request, response }: HttpContextContract) {
    const { id } = params;
    const { academic_year_id } = request.qs();
    let ayStart, ayEnd

    interface dataFormat {
      nis: string | null,
      nisn: string | null,
      name: string | null,
      payments: {
        spp: any[]
        bp: any[]
        bwt: any[]
      },
      billings: {
        spp: any[]
        bp: any[]
        bwt: any[]
      },
      total_tagihan_spp: number,
      total_tagihan_bp: number,
      total_tagihan_bwt: number,
      total_tunggakan: number,
      total: number
    }

    const data: dataFormat = {
      nis: "",
      nisn: "",
      name: "",
      payments: { spp: [], bp: [], bwt: [] },
      billings: { spp: [], bp: [], bwt: [] },
      total_tagihan_spp: 0,
      total_tagihan_bp: 0,
      total_tagihan_bwt: 0,
      total_tunggakan: 0,
      total: 0
    }

    if (!uuidValidation(id)) {
      return response.badRequest({ message: "ID tidak valid" });
    }

    try {
      if (academic_year_id) {
        const academicYear = await AcademicYear.findOrFail(academic_year_id)

        if (academicYear){
          [ayStart, ayEnd] = academicYear.year.split(' - ')
        }
      } else {
        const academicYear = await AcademicYear.findByOrFail('active', true)

        if (academicYear){
          [ayStart, ayEnd] = academicYear.year.split(' - ')
        }
      }
      const student = await Student.query()
        .where('id', id)
        .select('id', 'nis', 'nisn', 'name', 'class_id')
        .preload('class', qClass => qClass.select('name'))
        .preload('accounts')
        .firstOrFail()

      data.nis = student.nis
      data.nisn = student.nisn
      data.name = student.name

      const billings = await Billing.query()
        .whereHas('account', a => a.whereHas('student', s => s.where('id', student.id)))
        .andWhereBetween('due_date', [`${ayStart}-07-01`, `${ayEnd}-06-30`])
        .preload('transactions', t => t.pivotColumns(['amount']))
        .orderBy('due_date', 'asc')

      const debts = await Billing.query()
        .whereHas('account', a => a.whereHas('student', s => s.where('id', student.id)))
        .andWhere('due_date', '<', `${ayStart}-07-01`)
        .preload('transactions', t => t.pivotColumns(['amount']))

      let totalSpp = 0
      let totalBwt = 0
      let totalBp = 0

      billings.map(bill => {
        const totalPaid = bill.transactions.reduce((sum, current) => sum + current.$extras.pivot_amount, 0)

        bill.$extras.remaining_amount = bill.amount - totalPaid

        if (bill.$extras.remaining_amount > 0) bill.$extras.status = BillingStatus.PAID_PARTIAL
        if (bill.$extras.remaining_amount === bill.amount) bill.$extras.status = BillingStatus.UNPAID
        if (bill.$extras.remaining_amount <= 0) bill.$extras.status = BillingStatus.PAID_FULL

        const diff = bill.createdAt.diffNow('milliseconds').toObject().milliseconds!
        if (diff <= 0) bill.$extras.due_note = "Sudah Jatuh Tempo"

        if (bill.type === BillingType.SPP) {
          const payload = {
            bulan: bill.dueDate.toFormat("MMMM", {locale: 'id'}),
            nominal_tagihan: bill.amount,
            status: bill.$extras.status,
            keterangan: bill.$extras.due_note
          }

          if (bill.transactions.length > 0) {
            const payloadPayment = {
              bulan: bill.dueDate.toFormat("MMMM", {locale: 'id'}),
              tanggal_bayar: bill.transactions[bill.transactions.length - 1].createdAt.toSQLDate(),
              nominal_bayar: totalPaid,
              status: bill.$extras.status
            }

            data.payments.spp.push(payloadPayment)
          }

          totalSpp += bill.$extras.remaining_amount
          data.billings.spp.push(payload)
        } else if (bill.type === BillingType.BP || bill.type === BillingType.BWT) {
          const payload = {
            nominal_tagihan: bill.amount,
            status: bill.$extras.status,
          }

          if (bill.transactions.length > 0) {
            const payloadPayment = {
              tanggal_bayar: bill.transactions[bill.transactions.length - 1].createdAt.toSQLDate(),
              nominal_bayar: totalPaid,
            }

            data.payments[bill.type].push(payloadPayment)
          }
          
          if (bill.type === BillingType.BP) {
            totalBp += bill.$extras.remaining_amount
          } else if (bill.type === BillingType.BWT) {
            totalBwt += bill.$extras.remaining_amount
          }
          data.billings[bill.type].push(payload)
        }
      })

      let totalDebt = 0
      debts.map(debt => {
        const totalPaid = debt.transactions.reduce((sum, current) => sum + current.$extras.pivot_amount, 0)

        debt.$extras.remaining_amount = debt.amount - totalPaid
        totalDebt += debt.$extras.remaining_amount
      })
      data.total_tunggakan = totalDebt
      data.total_tagihan_bp = totalBp
      data.total_tagihan_bwt = totalBwt
      data.total_tagihan_spp = totalSpp
      data.total = totalDebt + totalBp + totalBwt + totalSpp

      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      const message = "FBIL-REK: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }

  }
}
