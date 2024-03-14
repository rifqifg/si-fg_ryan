import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import RencanaPengambilanNilai from "../../Models/RencanaPengambilanNilai";
import { validate as uuidValidation } from "uuid";
import Semester from "../../Models/Semester";
import { statusRoutes } from "App/Modules/Log/lib/enum";
import { CreateRouteHist } from "App/Modules/Log/Helpers/createRouteHist";
import { DateTime } from "luxon";
import User from "App/Models/User";
import { RolesHelper } from "App/Helpers/rolesHelper";

export default class RencanaPengambilanNilaisController {
  public async index({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis();
    CreateRouteHist(statusRoutes.START, dateStart);
    const {
      page = 1,
      limit = 10,
      keyword = "",
      subjectId = "",
      teacherId = "",
      foundationId
    } = request.qs();

    if (!uuidValidation(subjectId) && subjectId)
      return response.badRequest({ message: "Subject ID tidak valid" });

    if (!uuidValidation(teacherId) && teacherId)
      return response.badRequest({ message: "Teacher ID tidak valid" });

    const user = await User.query()
      .preload('employee', e => e
        .select('id', 'name', 'foundation_id'))
      .preload('roles', r => r
        .preload('role'))
      .where('employee_id', auth.user!.$attributes.employeeId)
      .first()

    const userObject = JSON.parse(JSON.stringify(user))
    const roles = await RolesHelper(userObject)

    try {
      const semester = await Semester.query()
        .where("isActive", true)
        .select("*")
        .firstOrFail();

      const data = await RencanaPengambilanNilai.query()
        .select("*")
        .whereILike("topik", `%${keyword}%`)
        .if(subjectId, (s) => s.where("subjectId", subjectId))
        .if(teacherId, (t) => t.where("teacherId", teacherId))
        .preload("metodePengambilanNilai", (mp) => mp.select("id", "nama"))
        .preload(
          "programSemesterDetail",
          (prosemDetail) => (
            prosemDetail.select("id", "kompetensiIntiId", "programSemesterId"),
            prosemDetail.preload("kompetensiInti", (ki) =>
              ki.select("id", "nama")
            )
          )
        )
        .preload(
          "teachers",
          (t) => (
            t.select("id", "employeeId"),
            t.preload("employee", (e) => e.select("id", "name"))
          )
        )
        .preload("subjects", (s) => s.select("name"))
        .if(!roles.includes('super_admin'), query => query
          .whereHas('subjects', s => s.where('foundation_id', user!.employee.foundationId))
        )
        .if(roles.includes('super_admin') && foundationId, query => query
          .whereHas('subjects', s => s.where('foundation_id', foundationId))
        )
        .paginate(page, limit);

      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({
        message: "Berhasil mengambil data",
        data: { semester, data },
      });
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
        programSemesterDetailId: schema.string([
          rules.uuid({ version: 4 }),
          rules.trim(),
        ]),
        metodePengambilanNilaiId: schema.string([
          rules.uuid({ version: 4 }),
          rules.trim(),
        ]),
        subjectId: schema.string([rules.uuid({ version: 4 }), rules.trim()]),
        teacherId: schema.string([rules.uuid({ version: 4 }), rules.trim()]),
        topik: schema.string([rules.trim()]),
        presentase: schema.number(),
        pertemuan: schema.number(),
      }),
    });

    try {
      const data = await RencanaPengambilanNilai.create(payload);

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
        })
        .preload("subjects", (s) => s.select("name"))
        .preload(
          "teachers",
          (t) => (
            t.select("id", "employeeId"),
            t.preload("employee", (e) => e.select("id", "name"))
          )
        )
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
        subjectId: schema.string.optional([
          rules.uuid({ version: 4 }),
          rules.trim(),
        ]),
        teacherId: schema.string.optional([
          rules.uuid({ version: 4 }),
          rules.trim(),
        ]),
        topik: schema.string.optional([rules.trim()]),
        presentase: schema.number.optional(),
        pertemuan: schema.number.optional(),
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
