import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Transaction from '../../Models/Transaction';
import CreateTransactionValidator from '../../Validators/CreateTransactionValidator';
import { validate as uuidValidation } from "uuid";
import UpdateTransactionValidator from '../../Validators/UpdateTransactionValidator';
import { BillingStatus } from '../../lib/enums';
import { DateTime } from 'luxon';

export default class TransactionsController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, mode = "page", date_start, date_end } = request.qs();
    let dateStart: string, dateEnd: string

    if (date_start) dateStart = DateTime.fromSQL(date_start).startOf('day').toString()
    if (date_end) dateEnd = DateTime.fromSQL(date_end).endOf('day').toString()

    try {
      let data: Transaction[]
      if (mode === 'page') {
        data = await Transaction.query()
          .if(date_start, qDateStart => qDateStart.where('createdAt', '>=', dateStart))
          .if(date_end, qDateEnd => qDateEnd.andWhere('createdAt', '<=', dateEnd))
          .preload('billings', qBilling => {
            qBilling
              .select('name', 'amount', 'account_id')
              .pivotColumns(['amount'])
              .preload('account', qAccount => qAccount.select('account_name'))
          })
          .paginate(page, limit);
      } else {
        data = await Transaction.query()
          .preload('billings', qBilling => {
            qBilling
              .select('name', 'amount', 'account_id')
              .pivotColumns(['amount'])
              .preload('account', qAccount => qAccount.select('account_name'))
          })
      }

      // TODO: refactor, gabungin query related billings ke query atas
      await Promise.all(data.map(async transaction => {
        const relatedBillings = await transaction.related('billings').query().pivotColumns(['amount'])
        transaction.$extras.amount = relatedBillings.reduce((sum, current) => sum + current.$extras.pivot_amount, 0)
      }))

      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "FTR-IND: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateTransactionValidator)

    const { items: paidItems, ...transactionPayload } = payload

    // hapus item yg amountnya dibawah 0
    const filteredPaidItems = paidItems.filter(item => item.amount > 0)

    try {
      const transactionData: Transaction = await Transaction.create(transactionPayload)

      const attachBill = filteredPaidItems.reduce((result, item) => {
        result[item.billing_id] = { amount: item.amount }
        return result
      }, {})

      await transactionData.related('billings').attach(attachBill)

      const data = await Transaction.query()
        .where('id', transactionData.id)
        .preload('billings')
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      const message = "FTR-STO: " + error.message || error;
      response.badRequest({
        message: "Gagal menyimpan data",
        error: message,
      })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params;

    if (!uuidValidation(id)) {
      return response.badRequest({ message: "ID tidak valid" });
    }

    try {
      const data = await Transaction.query()
        .where('id', id)
        .preload('billings', qBilling => {
          qBilling
            .pivotColumns(['amount'])
            .select('name', 'amount', 'account_id', 'due_date')
            .preload('account', qAccount => {
              qAccount.select('account_name', 'number')
            })
        })
        .preload('teller', qEmployee => qEmployee.select('name'))
        .firstOrFail()

      const relatedBillings = await data.related('billings').query().pivotColumns(['amount'])
      data.$extras.amount = relatedBillings.reduce((sum, current) => sum + current.$extras.pivot_amount, 0)

      data.billings.forEach(bill => {
        bill.$extras.remaining_amount = bill.amount - bill.$extras.pivot_amount

        if (bill.$extras.remaining_amount > 0) bill.$extras.status = BillingStatus.PAID_PARTIAL
        if (bill.$extras.remaining_amount === bill.amount) bill.$extras.status = BillingStatus.UNPAID
        if (bill.$extras.remaining_amount <= 0) bill.$extras.status = BillingStatus.PAID_FULL
      })

      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "FTR-SHO: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params;
    const payload = await request.validate(UpdateTransactionValidator);
    if (JSON.stringify(payload) === "{}") {
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }

    try {
      const transaction = await Transaction.findOrFail(id);
      const data = await transaction.merge(payload).save();

      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "FTR-UPD: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengubah data",
        error: message,
        error_data: error,
      });
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "ID tidak valid" })
    }

    try {
      const data = await Transaction.findOrFail(id)

      // hapus dulu semua data di tabel pivot
      await data.related('billings').detach()
      
      await data.delete()

      response.ok({ message: "Berhasil menghapus data" })
    } catch (error) {
      const message = "FMB-DES: " + error.message || error
      console.log(error)
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      })
    }
  }
}
