import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import MetodePengambilanNilai from "../../Models/MetodePengambilanNilai";

export default class MetodePengambilanNilaisController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10 } = request.qs();

    try {
      let data = {};
      data = await MetodePengambilanNilai.query().select("*").paginate(page, limit);
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      response.badRequest({
        message: "Gagal mengambil data",
        error: error.message,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate({
      schema: schema.create({
        nama: schema.string([rules.trim()]),
      }),
    });
    try {
      const data = await MetodePengambilanNilai.create(payload);

      response.ok({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      response.badRequest({
        message: "Gagal mengambil data",
        error: error.message,
      });
    }
  }

  public async show({ response, params }: HttpContextContract) {
    const { id } = params;

    try {
      const data = await MetodePengambilanNilai.query()
        .where("id", "=", id)
        .firstOrFail();

      if (!data)
        return response.badRequest({
          message: "Kompetensi Inti tidak ditemukan",
        });

      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      response.badRequest({
        message: "Gagal mengambil data",
        error: error.message,
      });
    }
  }

  public async update({
    request,
    response,
    params,
  }: HttpContextContract) {
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
      const metodePengambilanNilai = await MetodePengambilanNilai.findByOrFail("id", id);
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
