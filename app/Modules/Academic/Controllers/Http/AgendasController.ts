import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Agenda from "../../Models/Agenda";
import CreateAgendumValidator from "../../Validators/CreateAgendumValidator";
import UpdateAgendumValidator from "../../Validators/UpdateAgendumValidator";

export default class AgendasController {
  public async index({ response }: HttpContextContract) {
    try {
      const data = await Agenda.query().select("*");

      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      response.badRequest({ message: "Gagal mengambil data", error });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateAgendumValidator);

    try {
      const data = await Agenda.create(payload);

      response.ok({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      response.badRequest({ message: "Gagal menyimpan data", error });
    }
  }

  public async show({ response, params }: HttpContextContract) {
    const { id } = params;

    try {
      const data = await Agenda.findByOrFail("id", id);

      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      response.badRequest({ message: "Gagal mengambil data", error });
    }
  }

  public async update({ request, response, params }: HttpContextContract) {
    const { id } = params;

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

    try {
      const data = await Agenda.findByOrFail("id", id);
      await data.delete();

      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      response.badRequest({ message: "Gagal menghapus data" });
    }
  }
}
