import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import ProgramSemesterDetail from "../../Models/ProgramSemesterDetail";
import { validate as uuidValidation } from "uuid";

export default class ProgramSemesterDetailsController {
  public async index({ request, response, params }: HttpContextContract) {
    const { programSemesterId } = params;
    if (!uuidValidation(programSemesterId))
      return response.badRequest({ message: "Program Semeter ID tidak valid" });
    const { page = 1, limit = 10, mode = "page" } = request.qs();

    try {
      let data = {};
      if (mode === "page") {
        data = await ProgramSemesterDetail.query()
          .select("*")
          .where("programSemesterId", "=", programSemesterId)
          .preload("programSemester", (prosem) => prosem.select("*"))
          .paginate(page, limit);
      } else if (mode === "list") {
        data = await ProgramSemesterDetail.query()
          .select("*")
          .preload("programSemester", (prosem) => prosem.select("*"));
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

  public async store({ request, response, params }: HttpContextContract) {
    const { programSemesterId } = params;
    if (!uuidValidation(programSemesterId))
      return response.badRequest({ message: "Program Semeter ID tidak valid" });

    const payload = await request.validate({
      schema: schema.create({
        programSemesterId: schema.string([
          rules.uuid({ version: 4 }),
          rules.trim(),
        ]),
        kompetensiIntiId: schema.string([
          rules.uuid({ version: 4 }),
          rules.trim(),
        ]),
        kompetensiDasar: schema.string([rules.trim()]),
        kompetensiDasarIndex: schema.number(),
        pertemuan: schema.number(),
        materi: schema.string([rules.trim()]),
        metode: schema.string([rules.trim()]),
        kategori1: schema.boolean(),
        kategori2: schema.boolean(),
        kategori3: schema.boolean(),
      }),
    });

    try {
      const data = await ProgramSemesterDetail.create(payload);

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

    if (!uuidValidation(id))
      return response.badRequest({
        message: "Program Semeter Detail ID tidak valid",
      });

    try {
      const data = await ProgramSemesterDetail.query()
        .where("id", id)
        .preload("programSemester", (prosem) => prosem.select("*"))
        .preload("kompetensiInti", (ki) => ki.select("*")).firstOrFail()

        response.ok({message: 'Berhasil mengambil data', data})
    } catch (error) {
      response.badRequest({
        message: "Gagal mengambil data",
        error: error.message,
      });
    }
  }

  public async update({request, response, params}: HttpContextContract) {
    const { id } = params;

    if (!uuidValidation(id))
      return response.badRequest({
        message: "Program Semeter Detail ID tidak valid",
      });

      const payload = await request.validate({schema: schema.create({
        programSemesterId: schema.string.optional([
          rules.uuid({ version: 4 }),
          rules.trim(),
        ]),
        kompetensiIntiId: schema.string.optional([
          rules.uuid({ version: 4 }),
          rules.trim(),
        ]),
        kompetensiDasar: schema.string.optional([rules.trim()]),
        kompetensiDasarIndex: schema.number.optional(),
        pertemuan: schema.number.optional(),
        materi: schema.string.optional([rules.trim()]),
        metode: schema.string.optional([rules.trim()]),
        kategori1: schema.boolean.optional(),
        kategori2: schema.boolean.optional(),
        kategori3: schema.boolean.optional(),
      })})

      if (JSON.stringify(payload) === "{}") {
        console.log("data update kosong");
        return response.badRequest({ message: "Data tidak boleh kosong" });
      }

      try {
        const prosemDetail = await ProgramSemesterDetail.firstOrFail(id)
        const data = await prosemDetail.merge(payload).save()

        response.ok({message: 'Berhasil memperbarui data', data})
      } catch (error) {
        response.badRequest({message: 'Gagal memperbarui data', error: error.message})
      }

  }

  public async destroy({response, params}: HttpContextContract) {
    const { id } = params;

    if (!uuidValidation(id))
      return response.badRequest({
        message: "Program Semeter Detail ID tidak valid",
      });

      try {
        const data = await ProgramSemesterDetail.firstOrFail(id)
        await data.delete()

        response.ok({message: 'Berhasil menghapus data'})
      } catch(error) {
        response.badRequest({message: 'Gagal menghapus data', error: error.message})
      }
  }
}
