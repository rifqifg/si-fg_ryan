import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { validate as uuidValidation } from "uuid";
import RencanaPengambilanNilai from "../../Models/RencanaPengambilanNilai";

export default class RencanaPengambilanNilaisController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", mode = "page" } = request.qs();

    try {
      let data = {};
      if (mode === "page") {
        data = await RencanaPengambilanNilai.query()
          .select("*")
          .paginate(page, limit);
      } else if (mode === "list") {
        data = await RencanaPengambilanNilai.query().select("*");
      } else {
        return response.badRequest({
          message: "Mode tidak dikenali, (pilih: page / list)",
        });
      }

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
        programSemesterDetailId: schema.string([
          rules.uuid({ version: 4 }),
          rules.trim(),
        ]),
        metodePengambilanNilaiId: schema.string([
          rules.uuid({ version: 4 }),
          rules.trim(),
        ]),
        topik: schema.string([rules.trim()]),
        presentase: schema.number(),
      }),
    });

    try {
      const data = await RencanaPengambilanNilai.create(payload);

      response.ok({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      response.badRequest({
        message: "Gagal menyimpan data",
        error: error.message,
      });
    }
  }

  public async show({ response, params }: HttpContextContract) {
    const { id } = params;

    if (!uuidValidation(id)) {
      return response.badRequest({
        message: "Rencana Pengambilan Nilain ID tidak valid",
      });
    }

    try {
      const data = await RencanaPengambilanNilai.query()
        .where("id", id)
        .preload("metodePengambilanNilai", (mtn) => mtn.select("*"))
        .preload("programSemesterDetail", (prosemDetail) => {
          prosemDetail.select("*");
          prosemDetail.preload("programSemester", (prosem) => {
            prosem.preload("teachers", t => t.preload('employee', e => e.select('name')));
            prosem.preload('mapel')
          });
        })
        .firstOrFail();

      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      response.badRequest({
        message: "Gagal mengambil data",
        error: error.message,
      });
    }
  }

  public async update({ request, response, params }: HttpContextContract) {
    const { id } = params;

    if (!uuidValidation(id)) {
      return response.badRequest({
        message: "Rencana Pengambilan Nilain ID tidak valid",
      });
    }

    const payload = await request.validate({
      schema: schema.create({
        programSemesterDetailId: schema.string.optional([
          rules.uuid({ version: 4 }),
          rules.trim(),
        ]),
        metodePengambilanNilaiId: schema.string.optional([
          rules.uuid({ version: 4 }),
          rules.trim(),
        ]),
        topik: schema.string.optional([rules.trim()]),
        presentase: schema.number.optional(),
      }),
    });

    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }

    try {
      const rpn = await RencanaPengambilanNilai.findOrFail(id);
      const data = await rpn.merge(payload).save();

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

    if (!uuidValidation(id)) {
      return response.badRequest({
        message: "Rencana Pengambilan Nilain ID tidak valid",
      });
    }

    try {
      const data = await RencanaPengambilanNilai.findOrFail(id);
      await data.delete();

      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      response.badRequest({
        message: "Gagal menghapus data",
        error: error.message,
      });
    }
  }
}
