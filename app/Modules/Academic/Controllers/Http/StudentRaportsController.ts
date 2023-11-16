import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { validate as uuidValidation } from "uuid";
import StudentRaport from "App/Modules/Academic/Models/StudentRaport";
import { CreateRouteHist } from "App/Modules/Log/Helpers/createRouteHist";
import { statusRoutes } from "App/Modules/Log/lib/enum";
import { DateTime } from "luxon";

export default class StudentRaportsController {
  public async index({ response, params }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis();
    CreateRouteHist(statusRoutes.START, dateStart);
    const { raport_id: raportId } = params;

    if (!uuidValidation(raportId)) {
      return response.badRequest({ message: "Raport ID tidak valid" });
    }

    try {
      const data = await StudentRaport.query()
        .select("*")
        .where("raportId", raportId)
        .preload("students", (s) =>
          (s.select(
            "id",
            "name",
            "class_id",
            
          ), s.preload("class", (c) => c.select("id", "name")))
        )

      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: error.message || error,
      });
    }
  }

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
