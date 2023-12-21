import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TriwulanEmployeeDetail from 'App/Models/TriwulanEmployeeDetail';
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist';
import { statusRoutes } from 'App/Modules/Log/lib/enum';
import UpdateTriwulanEmployeeDetailValidator from 'App/Validators/UpdateTriwulanEmployeeDetailValidator';
import { DateTime } from 'luxon';
import { validate as uuidValidation } from "uuid"

export default class TriwulanEmployeeDetailsController {
  public async update({ params, request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "TriwulanEmployeeDetails ID tidak valid" });
    }

    const payload = await request.validate(UpdateTriwulanEmployeeDetailValidator);
    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }
    try {
      const triwulanEmployeeDetail = await TriwulanEmployeeDetail.findOrFail(id);
      const data = await triwulanEmployeeDetail.merge(payload).save();
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "HRDTWED01: " + error.message || error;
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
