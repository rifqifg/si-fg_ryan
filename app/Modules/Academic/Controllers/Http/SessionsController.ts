import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { validate as uuidValidation } from "uuid";
import Session from "../../Models/Session";

export default class SessionsController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", mode = "page" } = request.qs();

    try {
      let data = {};
      if (mode === "page") {
        data = await Session.query()
          .whereILike("session", `%${keyword}%`)

          .paginate(page, limit);
      } else if (mode === "list") {
        data = await Session.query()
          .whereILike("session", `%${keyword}%`)
          .orderBy("session");
      } else {
        return response.badRequest({
          message: "Mode tidak dikenali, (pilih: page / list)",
        });
      }

      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "ACSE-INDEX: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Session ID tidak valid" });
    }

    try {
      const data = await Session.query().where("id", id).firstOrFail();
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "ACSE-SHOW: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }
}
