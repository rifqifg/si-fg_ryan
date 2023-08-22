import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Billing from '../../Models/Billing';
import CreateBillingValidator from '../../Validators/CreateBillingValidator';
import { validate as uuidValidation } from "uuid";
import UpdateBillingValidator from '../../Validators/UpdateBillingValidator';

export default class BillingsController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", mode = "page" } = request.qs();

    try {
      let data = {}
      if (mode === 'page') {
        data = await Billing.query()
          .whereILike("name", `%${keyword}%`)
          .paginate(page, limit);
      } else {
        data = await Billing.query().whereILike('name', `%${keyword}%`)
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

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateBillingValidator)

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
      const data = await Billing.findOrFail(id)
      response.ok({ message: "Berhasil mengambil data", data });
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
}
