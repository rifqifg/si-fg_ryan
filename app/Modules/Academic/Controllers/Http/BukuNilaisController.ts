import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { validate as uuidValidation } from "uuid";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import BukuNilai from "../../Models/BukuNilai";
export default class BukuNilaisController {
  public async index({ response, params }: HttpContextContract) {
    const { mapel_id: mapelId } = params;
    if (!uuidValidation(mapelId))
      return response.badRequest({ message: "Mapel ID tidak valid" });

    try {
      const data = await BukuNilai.query()
        .where("mapelId", mapelId)
        .preload("students", (s) => s.select("name", "nisn", "nis"))
        .preload("teachers", (t) =>
          t.preload("employee", (e) => e.select("name", "nip", "nik"))
        )
        .preload("mapels", (m) => m.select("name"));

      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      response.badRequest({
        message: "Gagal mengambil data",
        error: error.message,
      });
    }
  }

  public async store({ request, response, params }: HttpContextContract) {
    const { mapel_id: mapelId } = params;

    const payload = await request.validate({
      schema: schema.create({
        programSemesterDetailId: schema.string([rules.uuid({ version: 4 })]),
        studentId: schema.string([rules.uuid({ version: 4 })]),
        teacherId: schema.string([rules.uuid({ version: 4 })]),
        nilai: schema.number(),
        type: schema.enum(["HARIAN", "UTS", "UAS"]),
      }),
    });

    try {
      const data = await BukuNilai.create({ ...payload, mapelId });

      response.ok({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      response.badRequest({ message: "Gagal menyimpan data" });
    }
  }

  public async show({ response, params }: HttpContextContract) {
    const { id } = params;

    try {
      const data = await BukuNilai.query()
        .where("id", id)
        .preload("mapels", (m) => m.select("name"))
        .preload("teachers", (t) =>
          t.preload("employee", (e) => e.select("name"))
        )
        .preload("programSemesterDetail", (prosemDetail) =>
          prosemDetail.select("kompetensiDasar", "materi")
        );
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
    if (!uuidValidation(id))
      return response.badRequest({ message: "Mapel ID tidak valid" });

    const payload = await request.validate({
      schema: schema.create({
        programSemesterDetailId: schema.string([rules.uuid({ version: 4 })]),
        studentId: schema.string([rules.uuid({ version: 4 })]),
        teacherId: schema.string([rules.uuid({ version: 4 })]),
        nilai: schema.number(),
        type: schema.enum(["HARIAN", "UTS", "UAS"]),
      }),
    });

    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }

    try {
      const bn = await BukuNilai.findOrFail(id);
      const data = await bn.merge(payload).save();

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
    if (!uuidValidation(id))
      return response.badRequest({ message: "Mapel ID tidak valid" });
    try {
      const data = await BukuNilai.findOrFail(id);
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
