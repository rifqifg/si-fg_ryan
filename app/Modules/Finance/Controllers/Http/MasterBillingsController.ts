import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import MasterBilling from '../../Models/MasterBilling';
import CreateMasterBillingValidator from '../../Validators/CreateMasterBillingValidator';

export default class MasterBillingsController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", mode = "page" } = request.qs();

    try {
      let data = {}
      if (mode === 'page') {
       data = await MasterBilling.query()
        .whereILike("name", `%${keyword}%`)
        .paginate(page, limit);
      } else {
        data = await MasterBilling.query().whereILike('name', `%${keyword}%`)
      }

      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "FMB-IND: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateMasterBillingValidator)
    try {
      const data = await MasterBilling.create(payload)
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      const message = "FMB-STO: " + error.message || error;
      response.badRequest({
        message: "Gagal menyimpan data",
        error: message,
      })
    }
  }
}
