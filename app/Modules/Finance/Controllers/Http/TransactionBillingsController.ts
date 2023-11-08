import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TransactionBilling from '../../Models/TransactionBilling';
import UpdateTransactionBillingValidator from '../../Validators/UpdateTransactionBillingValidator';
import Transaction from '../../Models/Transaction';
import Billing from '../../Models/Billing';
import DeleteTransactionBillingValidator from '../../Validators/DeleteTransactionBillingValidator';
import { DateTime } from 'luxon';
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist';
import { statusRoutes } from 'App/Modules/Log/lib/enum';

export default class TransactionBillingsController {
    public async index({ request, response }: HttpContextContract) {
        const dateStart = DateTime.now().toMillis()
        CreateRouteHist(statusRoutes.START, dateStart)
        const { page = 1, limit = 10, transaction_id, billing_id, mode = "page" } = request.qs()

        try {
            let data = {}
            if (mode === 'page') {
                data = await TransactionBilling.query()
                    .if(transaction_id, q => q.where('transaction_id', '=', transaction_id))
                    .if(billing_id, q => q.where('billing_id', '=', billing_id))
                    .paginate(page, limit);
            } else {
                data = await TransactionBilling.query()
            }

            CreateRouteHist(statusRoutes.FINISH, dateStart)
            response.ok({ message: "Berhasil mengambil data", data })
        } catch (error) {
            const message = "FBIL-INDEX: " + error.message || error;
            CreateRouteHist(statusRoutes.ERROR, dateStart, message)
            console.log(error);
            response.badRequest({
                message: "Gagal mengambil data",
                error: message,
                error_data: error,
            });
        }
    }

    public async update({ request, response }: HttpContextContract) {
        const dateStart = DateTime.now().toMillis()
        CreateRouteHist(statusRoutes.START, dateStart)
        const payload = await request.validate(UpdateTransactionBillingValidator);

        if (JSON.stringify(payload) === "{}") {
            return response.badRequest({ message: "Data tidak boleh kosong" });
        }

        try {
            const transaction = await Transaction.findOrFail(payload.transaction_id)
            const billing = await Billing.findOrFail(payload.billing_id)

            await transaction.related('billings').sync({ [billing.id]: { amount: payload.amount } }, false)

            const data = await TransactionBilling.query()
                .where('transaction_id', payload.transaction_id)
                .andWhere('billing_id', payload.billing_id)
                .firstOrFail()

            CreateRouteHist(statusRoutes.FINISH, dateStart)
            response.ok({ message: "Berhasil mengubah data", data });
        } catch (error) {
            const message = "FTB-IND: " + error.message || error;
            CreateRouteHist(statusRoutes.ERROR, dateStart, message)
            console.log(error);
            response.badRequest({
                message: "Gagal mengambil data",
                error: message,
                error_data: error,
            });
        }
    }

    public async destroy({ request, response }: HttpContextContract) {
        const dateStart = DateTime.now().toMillis()
        CreateRouteHist(statusRoutes.START, dateStart)
        const payload = await request.validate(DeleteTransactionBillingValidator);

        try {
            const transaction = await Transaction.findOrFail(payload.transaction_id)
            const billing = await Billing.findOrFail(payload.billing_id)

            await transaction.related('billings').detach([billing.id])

            CreateRouteHist(statusRoutes.FINISH, dateStart)
            response.ok({ message: "Berhasil menghapus data" })
        } catch (error) {
            const message = "FTB-DES: " + error.message || error
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
