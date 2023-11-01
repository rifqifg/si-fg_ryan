import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import MetodePengambilanNilai from "../../Models/MetodePengambilanNilai";
import { statusRoutes } from "App/Modules/Log/lib/enum";
import { CreateRouteHist } from "App/Modules/Log/Helpers/createRouteHist";
import { DateTime } from "luxon";

export default class MetodePengambilanNilaisController {
  public async index({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis();
    CreateRouteHist(statusRoutes.START, dateStart);
    const { page = 1, limit = 10 } = request.qs();

    try {
      let data = {};
      data = await MetodePengambilanNilai.query()
        .select("*")
        .paginate(page, limit);

      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: error.message,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis();
    CreateRouteHist(statusRoutes.START, dateStart);
    const payload = await request.validate({
      schema: schema.create({
        nama: schema.string([rules.trim()]),
      }),
    });
    try {
      const data = await MetodePengambilanNilai.create(payload);

      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: error.message,
      });
    }
  }

  public async show({ response, params }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis();
    CreateRouteHist(statusRoutes.START, dateStart);
    const { id } = params;

    try {
      const data = await MetodePengambilanNilai.query()
        .where("id", "=", id)
        .firstOrFail();

      if (!data)
        return response.badRequest({
          message: "Kompetensi Inti tidak ditemukan",
        });

      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: error.message,
      });
    }
  }

  public async update({ request, response, params }: HttpContextContract) {
    const { id } = params;

    const payload = await request.validate({
      schema: schema.create({
        nama: schema.string([rules.trim()]),
      }),
    });
    try {
      if (JSON.stringify(payload) === "{}") {
        console.log("data update kosong");
        return response.badRequest({ message: "Data tidak boleh kosong" });
      }
      const metodePengambilanNilai = await MetodePengambilanNilai.findByOrFail(
        "id",
        id
      );
      const data = await metodePengambilanNilai.merge(payload).save();

      response.ok({ message: "Berhasil memperbarui data", data });
    } catch (error) {
      response.badRequest({
        message: "Gagal memperbarui data",
        error: error.message,
      });
    }
  }

  public async destroy({ response, params }: HttpContextContract) {
    const { id } = params;

    try {
      const data = await MetodePengambilanNilai.findByOrFail("id", id);
      await data.delete();

      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      response.badRequest({ message: "Gagal menghapus data" });
    }
  }
}
