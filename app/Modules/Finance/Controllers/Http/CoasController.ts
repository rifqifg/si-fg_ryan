import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Coa from '../../Models/Coa';
import CreateCoaValidator from 'App/Modules/Finance/Validators/CreateCoaValidator';
import UpdateCoaValidator from '../../Validators/UpdateCoaValidator';
import { DateTime } from 'luxon';
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist';
import { statusRoutes } from 'App/Modules/Log/lib/enum';

export default class CoasController {
  public async index({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)

    const { page = 1, limit = 10, keyword = "", mode = "page" } = request.qs();

    try {
      let data = {}
      if (mode === 'page') {
       data = await Coa.query()
        .whereILike("name", `%${keyword}%`)
        .paginate(page, limit);
      } else {
        data = await Coa.query().whereILike('name', `%${keyword}%`)
      }

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "FCO-IND: " + error.message || error;
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

    const payload = await request.validate(CreateCoaValidator)
    try {
      const data = await Coa.create(payload)

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      const message = "FCO-STO: " + error.message || error;
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

    try {
      const data = await Coa.findOrFail(id)

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "FCO-SHO: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)

    const { id } = params;
    const payload = await request.validate(UpdateCoaValidator)
    
    if (JSON.stringify(payload) === "{}") {
      return response.badRequest({ message: "Data tidak boleh kosong" })
    }

    try {
      const coa = await Coa.findOrFail(id)
      const data = await coa.merge(payload).save()
      CreateRouteHist(statusRoutes.FINISH, dateStart)

      response.ok({ message: "Berhasil mengubah data", data })
    } catch (error) {
      const message = "FCO-UPD: " + error.message || error
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error)
      response.badRequest({
        message: "Gagal mengubah data",
        error: message,
        error_data: error,
      })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)

    const { id } = params;

    try {
      const data = await Coa.findOrFail(id);
      await data.delete();

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      const message = "FCO-DES: " + error.message || error;
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
