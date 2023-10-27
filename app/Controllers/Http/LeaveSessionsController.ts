import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LeaveSession from 'App/Models/LeaveSession'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'
import CreateLeaveSessionValidator from 'App/Validators/CreateLeaveSessionValidator'
import UpdateLeaveSessionValidator from 'App/Validators/UpdateLeaveSessionValidator'
import { DateTime } from 'luxon'
import { validate as uuidValidation } from "uuid"

export default class LeaveSessionsController {
  public async index({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { page = 1, limit = 10, keyword = "", fromDate = "", toDate = "", employeeId } = request.qs()

    try {
      let data
      if (fromDate && toDate) {
        data = await LeaveSession.query()
          .preload('employee', em => em.select('name'))
          .whereHas('employee', e => e.whereILike('name', `%${keyword}%`))
          .andWhere(query => {
            query.whereBetween('date', [fromDate, toDate])
          })
          .andWhere(query => {
            if (employeeId) {
              query.where('employee_id', employeeId)
            }
          })
          .paginate(page, limit)
      } else {
        data = await LeaveSession.query()
          .preload('employee', em => em.select('name'))
          .whereHas('employee', e => e.whereILike('name', `%${keyword}%`))
          .andWhere(query => {
            if (employeeId) {
              query.where('employee_id', employeeId)
            }
          })
          .paginate(page, limit)
      }

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Data Berhasil Didapatkan", data })
    } catch (error) {
      const message = "HRDLES01: " + error.message || error;
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
    const payload = await request.validate(CreateLeaveSessionValidator)

    try {
      const data = await LeaveSession.create(payload);
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.created({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      const message = "HRDLES02: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "LeaveSession ID tidak valid" });
    }

    try {
      const data = await LeaveSession.query().where("id", id).firstOrFail();
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "HRDLES03: " + error.message || error;
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
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "LeaveSession ID tidak valid" });
    }

    const payload = await request.validate(UpdateLeaveSessionValidator);
    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }
    try {
      const leave = await LeaveSession.findOrFail(id);
      const data = await leave.merge(payload).save();
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "HRDLES04: " + error.message || error;
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
      return response.badRequest({ message: "LeaveSession ID tidak valid" });
    }

    try {
      const data = await LeaveSession.findOrFail(id);
      await data.delete();
      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      const message = "HRDLES05: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }
}
