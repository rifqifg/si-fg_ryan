import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Transaction from '../../Models/Transaction';
import CreateTransactionValidator from '../../Validators/CreateTransactionValidator';

export default class TransactionsController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, mode = "page" } = request.qs();

    try {
      let data = {}
      if (mode === 'page') {
        data = await Transaction.query()
          .preload('billing', qBilling => {
            qBilling.select('name', 'account_id').preload('account', qAccount => qAccount.select('account_name'))
          })
          .paginate(page, limit);
      } else {
        data = await Transaction.query()
          .preload('billing', qBilling => {
            qBilling.select('name', 'account_id').preload('account', qAccount => qAccount.select('account_name'))
          })
      }

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
    try {
      const data = await Transaction.create(payload)
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      const message = "FTR-STO: " + error.message || error;
      response.badRequest({
        message: "Gagal menyimpan data",
        error: message,
      })
    }
  }
}
