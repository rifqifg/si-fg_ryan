import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TransactionBilling from '../../Models/TransactionBilling';
import UpdateTransactionBillingValidator from '../../Validators/UpdateTransactionBillingValidator';
import Transaction from '../../Models/Transaction';
import Billing from '../../Models/Billing';
import DeleteTransactionBillingValidator from '../../Validators/DeleteTransactionBillingValidator';

export default class TransactionBillingsController {
    public async index({ request, response }: HttpContextContract) {
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

    public async update({ request, response }: HttpContextContract) {
        const payload = await request.validate(UpdateTransactionBillingValidator);

        // if (JSON.stringify(payload) === "{}" || payload.transaction_billings.length <= 0) {
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

            response.ok({ message: "Berhasil mengubah data", data });
        } catch (error) {
            const message = "FTB-IND: " + error.message || error;
            console.log(error);
            response.badRequest({
                message: "Gagal mengambil data",
                error: message,
                error_data: error,
            });
        }
    }

    public async destroy({ request, response }: HttpContextContract) {
        const payload = await request.validate(DeleteTransactionBillingValidator);

        try {
            const transaction = await Transaction.findOrFail(payload.transaction_id)
            const billing = await Billing.findOrFail(payload.billing_id)

            await transaction.related('billings').detach([billing.id])

            response.ok({ message: "Berhasil menghapus data" })
        } catch (error) {
            const message = "FTB-DES: " + error.message || error
            console.log(error)
            response.badRequest({
                message: "Gagal menghapus data",
                error: message,
                error_data: error,
            })
        }
    }
}
