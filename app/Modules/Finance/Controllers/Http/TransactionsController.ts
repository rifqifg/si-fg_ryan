import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Transaction from '../../Models/Transaction';
import CreateTransactionValidator from '../../Validators/CreateTransactionValidator';
import { validate as uuidValidation } from "uuid";
import UpdateTransactionValidator from '../../Validators/UpdateTransactionValidator';
import { BillingStatus } from '../../lib/enums';
import { DateTime } from 'luxon';
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist';
import { statusRoutes } from 'App/Modules/Log/lib/enum';
import Billing from '../../Models/Billing';

export default class TransactionsController {
  public async index({ request, response }: HttpContextContract) {
    const dateStartLog = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStartLog)

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
      // await Promise.all(data.map(async transaction => {
      //   const relatedBillings = await transaction.related('billings').query().pivotColumns(['amount'])
      //   transaction.$extras.amount = relatedBillings.reduce((sum, current) => sum + current.$extras.pivot_amount, 0)
      // }))

      CreateRouteHist(statusRoutes.FINISH, dateStartLog)
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "FTR-IND: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStartLog, message)
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

    const payload = await request.validate(CreateTransactionValidator)

    const { items: paidItems, ...transactionPayload } = payload
    const totalPaid = paidItems.reduce((sum, next) => sum += next.amount, 0)

    // hapus item yg amountnya dibawah 0
    const filteredPaidItems = paidItems.filter(item => item.amount > 0)

    try {
      const transactionData: Transaction = await Transaction.create({...transactionPayload, amount: totalPaid})

      const attachBill = filteredPaidItems.reduce((result, item) => {
        result[item.billing_id] = { amount: item.amount }
        return result
      }, {})

      // TODO: cari decorator utk attach,
      // lalu pindahkan kode utk update remaining amount billing kesana
      await transactionData.related('billings').attach(attachBill)

      const mergeArray: any[] = []
      const billings = await transactionData.related('billings').query().pivotColumns(['amount'])

      billings.forEach(bill => {
        const newRemainingAmount = bill.remainingAmount - bill.$extras.pivot_amount
        let newStatus: BillingStatus = bill.status

        if (newRemainingAmount > 0) newStatus = BillingStatus.PAID_PARTIAL
        if (newRemainingAmount === bill.amount) newStatus = BillingStatus.UNPAID
        if (newRemainingAmount <= 0) newStatus = BillingStatus.PAID_FULL

        mergeArray.push({
          id: bill.id,
          remainingAmount: newRemainingAmount,
          status: newStatus
        })
      })

      await Billing.updateOrCreateMany('id', mergeArray)

      const data = await Transaction.query()
        .where('id', transactionData.id)
        .preload('billings')
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      const message = "FTR-STO: " + error.message || error;
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

      data.billings.forEach(bill => {
        bill.$extras.remaining_amount = bill.amount - bill.$extras.pivot_amount

        if (bill.$extras.remaining_amount > 0) bill.$extras.status = BillingStatus.PAID_PARTIAL
        if (bill.$extras.remaining_amount === bill.amount) bill.$extras.status = BillingStatus.UNPAID
        if (bill.$extras.remaining_amount <= 0) bill.$extras.status = BillingStatus.PAID_FULL
      })

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "FTR-SHO: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)

    const { id } = params;
    const payload = await request.validate(UpdateTransactionValidator);
    if (JSON.stringify(payload) === "{}") {
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }

    try {
      const transaction = await Transaction.findOrFail(id);
      const data = await transaction.merge(payload).save();

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "FTR-UPD: " + error.message || error;
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

    const { id } = params
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "ID tidak valid" })
    }

    try {
      const data = await Transaction.findOrFail(id)

      const mergeArray: any[] = []
      const billings = await data.related('billings').query().pivotColumns(['amount'])

      billings.forEach(bill => {
        const newRemainingAmount = bill.remainingAmount + bill.$extras.pivot_amount
        let newStatus: BillingStatus = bill.status

        if (newRemainingAmount > 0) newStatus = BillingStatus.PAID_PARTIAL
        if (newRemainingAmount === bill.amount) newStatus = BillingStatus.UNPAID
        if (newRemainingAmount <= 0) newStatus = BillingStatus.PAID_FULL

        mergeArray.push({
          id: bill.id,
          remainingAmount: newRemainingAmount,
          status: newStatus
        })
      })

      await Billing.updateOrCreateMany('id', mergeArray)
      await data.related('billings').detach()
      await data.delete()

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil menghapus data" })
    } catch (error) {
      const message = "FMB-DES: " + error.message || error
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error)
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      })
    }
  }
}
