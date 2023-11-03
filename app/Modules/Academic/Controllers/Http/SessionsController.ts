import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { validate as uuidValidation } from "uuid";
import Session from "../../Models/Session";
import { statusRoutes } from "App/Modules/Log/lib/enum";
import { CreateRouteHist } from "App/Modules/Log/Helpers/createRouteHist";
import { DateTime } from "luxon";

export default class SessionsController {
  public async index({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis();
    CreateRouteHist(statusRoutes.START, dateStart);
    const { page = 1, limit = 10, keyword = "", mode = "page" } = request.qs();

    try {
      let data = {};
      if (mode === "page") {
        data = await Session.query()
          .whereILike("session", `%${keyword}%`)
          .paginate(page, limit);
      } else {
        data = await Session.query().whereILike("session", `%${keyword}%`);
      }

      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "ACSE-INDEX: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message);
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis();
    CreateRouteHist(statusRoutes.START, dateStart);
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Session ID tidak valid" });
    }

    try {
      const data = await Session.query().where("id", id).firstOrFail();

      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "ACSE-SHOW: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message);
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }
}
