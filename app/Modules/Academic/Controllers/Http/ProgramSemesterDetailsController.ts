import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import ProgramSemesterDetail from "../../Models/ProgramSemesterDetail";
import { validate as uuidValidation } from "uuid";
import ProgramSemester from "../../Models/ProgramSemester";
import { statusRoutes } from "App/Modules/Log/lib/enum";
import { CreateRouteHist } from "App/Modules/Log/Helpers/createRouteHist";
import { DateTime } from "luxon";

export default class ProgramSemesterDetailsController {
  public async index({ response, params }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis();
    CreateRouteHist(statusRoutes.START, dateStart);
    const { program_semester_id: programSemesterId } = params;

    if (!uuidValidation(programSemesterId))
      return response.badRequest({ message: "Program Semeter ID tidak valid" });
    try {
      const data = await ProgramSemesterDetail.query()
        .select("*")
        .where("programSemesterId", programSemesterId)
        .preload("kompetensiInti", (ki) => ki.select("nama"))
        .preload("teachingJournal", (tj) => tj.select("date_in"));

      const kelas = await await ProgramSemester.query()
        .where("id", programSemesterId)
        .preload("mapel", (m) => m.select("name"))
        .preload("teachers", (t) => {
          t.select("employeeId");
          t.preload("employee", (e) => e.select("name"));
          t.preload(
            "teaching",
            (th) => (
              th.select("classId"),
              th.preload("class", (c) => (c.select("name"), c.firstOrFail()))
            )
          );
        })
        .firstOrFail();

      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({
        message: "Berhasil mengambil data",
        data: { kelas, data },
      });
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: error.message,
      });
    }
  }

  public async store({ request, response, params }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis();
    CreateRouteHist(statusRoutes.START, dateStart);
    const { program_semester_id: programSemesterId } = params;
    if (!uuidValidation(programSemesterId))
      return response.badRequest({ message: "Program Semeter ID tidak valid" });

    const payload = await request.validate({
      schema: schema.create({
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
      const data = await ProgramSemesterDetail.create({
        ...payload,
        programSemesterId,
      });

      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error);
      response.badRequest({
        message: "Gagal menyimpan data",
        error: error.message,
      });
    }
  }

  public async show({ response, params }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis();
    CreateRouteHist(statusRoutes.START, dateStart);
    const { id } = params;

    if (!uuidValidation(id))
      return response.badRequest({
        message: "Program Semeter Detail ID tidak valid",
      });

    try {
      const data = await ProgramSemesterDetail.query()
        .where("id", id)
        .preload("programSemester", (prosem) => prosem.select("*"))
        .preload("kompetensiInti", (ki) => ki.select("*"))
        .firstOrFail();

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

    if (!uuidValidation(id))
      return response.badRequest({
        message: "Program Semeter Detail ID tidak valid",
      });

    const payload = await request.validate({
      schema: schema.create({
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
      }),
    });

    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }

    try {
      const prosemDetail = await ProgramSemesterDetail.findOrFail(id);
      const data = await prosemDetail.merge(payload).save();

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
      return response.badRequest({
        message: "Program Semeter Detail ID tidak valid",
      });

    try {
      const data = await ProgramSemesterDetail.findOrFail(id);
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
