import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Account from '../../Models/Account';
import CreateAccountValidator from '../../Validators/CreateAccountValidator';
import { validate as uuidValidation } from "uuid";
import UpdateAccountValidator from '../../Validators/UpdateAccountValidator';

export default class AccountsController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", mode = "page" } = request.qs();

    try {
      let data = {}
      if (mode === 'page') {
        data = await Account.query()
          .whereILike("account_name", `%${keyword}%`)
          .paginate(page, limit);
      } else {
        data = await Account.query().whereILike('account_name', `%${keyword}%`)
      }

      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "FAC-IND: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateAccountValidator)
    try {
      const data = await Account.create(payload)
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      const message = "FAC-STO: " + error.message || error;
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
      const data = await Account.findOrFail(id)
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "FAC-SHO: " + error.message || error;
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
    const payload = await request.validate(UpdateAccountValidator);
    if (JSON.stringify(payload) === "{}") {
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }

    try {
      const account = await Account.findOrFail(id);
      const data = await account.merge(payload).save();
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "FAC-UPD: " + error.message || error;
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
      const data = await Account.findOrFail(id);
      await data.delete();
      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      const message = "FAC-DES: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }
}
