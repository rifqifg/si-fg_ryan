import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import ProgramSemester from "../../Models/ProgramSemester";
import { validate as uuidValidation } from "uuid";

export default class ProgramSemestersController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, mode = "page" } = request.qs();

    try {
      let data = {};
      if (mode === "page") {
        data = await ProgramSemester.query()
          .select("*")
          .preload("teachers", (t) =>
            t.preload("employee", (e) => e.select("name"))
          )
          .preload("mapel", (m) => m.select("name"))
          .paginate(page, limit);
      } else if (mode === "list") {
        data = await ProgramSemester.query()
          .select("*")
          .preload("teachers", (t) =>
            t.preload("employee", (e) => e.select("name"))
          )
          .preload("mapel", (m) => m.select("name"));
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
        guruId: schema.string([rules.uuid({ version: 4 }), rules.trim()]),
        mapelId: schema.string([rules.uuid({ version: 4 }), rules.trim()]),
        totalPertemuan: schema.number(),
      }),
    });

    try {
      const data = await ProgramSemester.create(payload);

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
      return response.badRequest({ message: "Program Semeter ID tidak valid" });
    }

    try {
      const data = await ProgramSemester.query()
        .where("id",  id)
        .preload("mapel", (m) => m.select("name"))
        .preload("teachers", (t) =>
          t.preload("employee", (e) => e.select("name"))
        )
        .preload("programSemesterDetail", (prosemDetail) =>
          prosemDetail.select("*")
        )
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
      return response.badRequest({ message: "Program Semeter ID tidak valid" });
    }

    const payload = await request.validate({
      schema: schema.create({
        guruId: schema.string.optional([
          rules.uuid({ version: 4 }),
          rules.trim(),
        ]),
        mapelId: schema.string.optional([
          rules.uuid({ version: 4 }),
          rules.trim(),
        ]),
        totalPertemuan: schema.number.optional(),
      }),
    });

    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }

    try {
      const prosem = await ProgramSemester.findOrFail(id);
      const data = await prosem.merge(payload).save();

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
      return response.badRequest({ message: "Program Semeter ID tidak valid" });
    }

    try {
      const data = await ProgramSemester.findOrFail(id);
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
