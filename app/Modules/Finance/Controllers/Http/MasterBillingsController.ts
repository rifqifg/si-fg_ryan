import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import MasterBilling from '../../Models/MasterBilling';
import CreateMasterBillingValidator from '../../Validators/CreateMasterBillingValidator';
import { validate as uuidValidation } from "uuid";
import UpdateMasterBillingValidator from '../../Validators/UpdateMasterBillingValidator';

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

  public async show({ params, response }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) { return response.badRequest({ message: "ID tidak valid" })}

    try {
      const data = await MasterBilling.findOrFail(id)
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "FMB-SHO: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params;
    const payload = await request.validate(UpdateMasterBillingValidator);
    if (JSON.stringify(payload) === "{}") {
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }

    try {
      const masterBilling = await MasterBilling.findOrFail(id);
      const data = await masterBilling.merge(payload).save();
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "FMB-UPD: " + error.message || error;
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
      const data = await MasterBilling.findOrFail(id);
      await data.delete();
      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      const message = "FMB-DES: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }
}
