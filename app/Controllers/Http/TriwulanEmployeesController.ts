import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TriwulanEmployee from 'App/Models/TriwulanEmployee'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'
import UpdateTriwulanEmployeeValidator from 'App/Validators/UpdateTriwulanEmployeeValidator'
import { DateTime } from 'luxon'
import { validate as uuidValidation } from "uuid"

export default class TriwulanEmployeesController {
  public async index({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { page = 1, limit = 10, keyword = "", triwulanId } = request.qs()

    try {

      const data = await TriwulanEmployee.query()
        .preload('employee', em => em.select('name'))
        .whereHas('employee', e => e.whereILike('name', `%${keyword}%`))
        .andWhere('triwulan_id', triwulanId)
        .paginate(page, limit)

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Data Berhasil Didapatkan", data })
    } catch (error) {
      const message = "HRDTWE01: " + error.message || error;
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
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "MonthlyReportEmployee ID tidak valid" });
    }

    const payload = await request.validate(UpdateTriwulanEmployeeValidator);
    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }
    try {
      const triwulanEmployee = await TriwulanEmployee.findOrFail(id);
      const data = await triwulanEmployee.merge(payload).save();
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "HRDTWE02: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }
}
