import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { validate as uuidValidation } from "uuid";
import Agenda from "../../Models/Agenda";
import CreateAgendumValidator from "../../Validators/CreateAgendumValidator";
import UpdateAgendumValidator from "../../Validators/UpdateAgendumValidator";
import { CreateRouteHist } from "App/Modules/Log/Helpers/createRouteHist";
import { statusRoutes } from "App/Modules/Log/lib/enum";

export default class AgendasController {
  public async index({ request, response }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START);
    const { keyword = "", date = "" } = request.qs();

    try {
      const data = await Agenda.query()
        .select("*")
        .whereILike("name", `%${keyword}%`)
        .if(date, (q) => q.where("date", date))
        .preload("user", (s) => s.select("id", "name"));

      CreateRouteHist(request, statusRoutes.FINISH);
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      CreateRouteHist(request, statusRoutes.ERROR, error.message || error);
      response.badRequest({ message: "Gagal mengambil data", error });
    }
  }

  public async store({ request, response, auth }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START);
    const payload = await request.validate(CreateAgendumValidator);

    try {
      const data = await Agenda.create({ userId: auth?.user?.id, ...payload });

      CreateRouteHist(request, statusRoutes.FINISH);
      response.ok({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      CreateRouteHist(request, statusRoutes.ERROR, error.message || error);
      response.badRequest({ message: "Gagal menyimpan data", error });
    }
  }

  public async show({ request, response, params }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START);
    const { id } = params;

    try {
      const data = await Agenda.query()
        .preload("user", (s) => s.select("id", "name"))
        .where("id", id);

      CreateRouteHist(request, statusRoutes.FINISH);
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      CreateRouteHist(request, statusRoutes.ERROR, error.message || error);
      response.badRequest({ message: "Gagal mengambil data", error });
    }
  }

  public async update({ request, response, params }: HttpContextContract) {
    const { id } = params;

    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Agenda ID tidak valid" });
    }

    const payload = await request.validate(UpdateAgendumValidator);

    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }

    try {
      const agenda = await Agenda.findByOrFail("id", id);
      const data = await agenda.merge(payload).save();

      response.ok({ message: "Berhasil memperbarui data", data });
    } catch (error) {}
  }

  public async destroy({ response, params }: HttpContextContract) {
    const { id } = params;

    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Agenda ID tidak valid" });
    }

    try {
      const data = await Agenda.findByOrFail("id", id);
      await data.delete();

      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      response.badRequest({ message: "Gagal menghapus data" });
    }
  }
}
