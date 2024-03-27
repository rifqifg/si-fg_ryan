import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { DateTime } from 'luxon'
import { statusRoutes } from 'App/Modules/Log/lib/enum';
import AccountReference from '../../Models/AccountReference';
import CreateAccountReferenceValidator from '../../Validators/CreateAccountReferenceValidator';
import { validate as uuidValidation } from "uuid";
import UpdateAccountReferenceValidator from '../../Validators/UpdateAccountReferenceValidator';

export default class AccountReferencesController {
  public async index({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)

    const { account_id, tipe } = request.qs();

    try {
      const data = await AccountReference.query()
        .if(account_id, q => q.where('account_id', account_id))
        .if(tipe, q => q.where('type', tipe))
        .preload('account', qAccount => {
          qAccount.select('student_id', 'number')
          qAccount.preload('student', qStudent => qStudent.select('name', 'nisn'))
        })

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "FACREF-IND: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
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

    const payload = await request.validate(CreateAccountReferenceValidator)

    try {
      const data = await AccountReference.create(payload)

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      const message = "FACREF-STO: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      response.badRequest({
        message: "Gagal menyimpan data",
        error: message,
      })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)

    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "ID tidak valid" });
    }

    const payload = await request.validate(UpdateAccountReferenceValidator);

    if (JSON.stringify(payload) === "{}") {
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }

    try {
      const accountRef = await AccountReference.findOrFail(id);
      const data = await accountRef.merge(payload).save();

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "FACREF-UPD: " + error.message || error;
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

    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "ID tidak valid" });
    }

    try {
      const data = await AccountReference.findOrFail(id);
      await data.delete();

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      const message = "FACREF-DES: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }
}
