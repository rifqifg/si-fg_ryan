import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import ProgramSemester from "../../Models/ProgramSemester";
import { validate as uuidValidation } from "uuid";
import User from "App/Models/User";
import DuplicateProsemValidator from "../../Validators/DuplicateProsemValidator";
import ProgramSemesterDetail from "../../Models/ProgramSemesterDetail";
import { statusRoutes } from "App/Modules/Log/lib/enum";
import { CreateRouteHist } from "App/Modules/Log/Helpers/createRouteHist";
import { DateTime } from "luxon";

export default class ProgramSemestersController {
  public async index({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const {
      page = 1,
      limit = 10,
      mode = "page",
      subjectId = "",
      classId = "",
    } = request.qs();

    if (
      (subjectId && !uuidValidation(subjectId)) ||
      (classId && !uuidValidation(classId))
    ) {
      return response.badRequest({
        message: "Subject ID atau Class ID tidak valid",
      });
    }

    try {
      let data = {};
      const user = await User.query()
        .where("id", auth?.user!.id)
        .preload("roles", (r) => r.preload("role"))
        .firstOrFail();
      const userObject = JSON.parse(JSON.stringify(user));

      const teacher = userObject.roles?.find(
        (role) => role.role.name == "teacher"
      );

      const teacherId = await User.query()
        .where("id", user ? user.id : "")
        .preload("employee", (e) => e.preload("teacher", (t) => t.select("id")))
        .firstOrFail();

      if (mode === "page") {
        data = await ProgramSemester.query()
          .select("*")
          .withCount("programSemesterDetail", (q) => q.as("total_pertemuan"))
          .preload("teachers", (t) =>(
            t.preload("employee", (e) => e.select("name")), t.preload('teaching', teach => teach.select('*')))
          )
          .preload("class", (c) => c.select("name", "id"))
          .preload("mapel", (m) => m.select("name"))
          .if(subjectId, (q) => q.where("subjectId", subjectId))
          .if(classId, (q) => q.where("classId", classId))
          .if(teacher, (q) =>
            q.where("teacherId", teacherId.employee.teacher.id)
          )

          .paginate(page, limit);
      } else if (mode === "list") {
        data = await ProgramSemester.query()
          .select("*")
          .withCount("programSemesterDetail", (q) => q.as("total_pertemuan"))
          .preload("teachers", (t) =>(
            t.preload("employee", (e) => e.select("name")), t.preload('teaching', teach => teach.select('id')))
          )
          .preload("class", (c) => c.select("name", "id"))
          .if(subjectId, (q) => q.where("subjectId", subjectId))
          .if(teacher, (q) =>
            q.where("teacherId", teacherId.employee.teacher.id)
          )
          .if(classId, (q) => q.where("classId", classId))
          .preload("mapel", (m) => m.select("name"));
      } else {
        return response.badRequest({
          message: "Mode tidak dikenali, (pilih: page / list)",
        });
      }
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      response.badRequest({
        message: "Gagal mengambil data",
        error: error.message,
      });
    }
  }

  public async store({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const user = await User.query()
      .where("id", auth?.user!.id)
      .preload("roles", (r) => r.preload("role"))
      .firstOrFail();
    const userObject = JSON.parse(JSON.stringify(user));

    const teacher = userObject.roles?.find(
      (role) => role.role.name == "teacher"
    );

    const teacherId = await User.query()
      .where("id", user ? user.id : "")
      .preload("employee", (e) => e.preload("teacher", (t) => t.select("id")))
      .firstOrFail();

    let payload;

    if (teacher) {
      const newProsemNonAdminSchema = schema.create({
        teacherId: schema.string([
          rules.uuid({ version: 4 }),
          rules.trim(),
          rules.unique({
            table: "academic.program_semesters",
            column: "teacher_id",
            where: {
              subject_id: request.body().subjectId,
              class_id: request.body().classId,
            },
          }),
          rules.exists({
            table: "academic.teachers",
            column: "id",
            where: {
              id: teacherId.employee.teacher.id,
            },
          }),
        ]),
        subjectId: schema.string([
          rules.uuid({ version: 4 }),
          rules.exists({ table: "academic.subjects", column: "id" }),
          rules.unique({
            table: "academic.program_semesters",
            column: "teacher_id",
            where: {
              teacher_id: request.body().teacherId,
              class_id: request.body().classId,
            },
          }),
        ]),
        classId: schema.string.optional([
          rules.uuid({ version: 4 }),
          rules.exists({ table: "academic.classes", column: "id" }),
          rules.unique({
            table: "academic.program_semesters",
            column: "teacher_id",
            where: {
              subject_id: request.body().subjectId,
              teacher_id: request.body().teacherId,
            },
          }),
        ]),
      });
      try {
        payload = await request.validate({ schema: newProsemNonAdminSchema });
      } catch (error) {
        return response.badRequest({
          message: "Buatlah prosem sesuai dengan mapel anda",
          error: error.message,
        });
      }
    } else {
      const newProsemAdminSchema = schema.create({
        teacherId: schema.string([
          rules.uuid({ version: 4 }),
          rules.exists({ table: "academic.teachers", column: "id" }),
          rules.unique({
            table: "academic.program_semesters",
            column: "teacher_id",
            where: {
              subject_id: request.body().subjectId,
              class_id: request.body().classId,
            },
          }),
        ]),
        subjectId: schema.string([
          rules.uuid({ version: 4 }),
          rules.exists({ table: "academic.subjects", column: "id" }),
          rules.unique({
            table: "academic.program_semesters",
            column: "teacher_id",
            where: {
              teacher_id: request.body().teacherId,
              class_id: request.body().classId,
            },
          }),
        ]),
        classId: schema.string.optional([
          rules.uuid({ version: 4 }),
          rules.exists({ table: "academic.classes", column: "id" }),
          rules.unique({
            table: "academic.program_semesters",
            column: "teacher_id",
            where: {
              subject_id: request.body().subjectId,
              teacher_id: request.body().teacherId,
            },
          }),
        ]),
      });
      payload = await request.validate({ schema: newProsemAdminSchema });
    }
    try {
      const data = await ProgramSemester.create(payload);

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      response.badRequest({
        message: "Gagal menyimpan data",
        error: error.message,
      });
    }
  }

  public async show({  response, params }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { id } = params;

    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Program Semeter ID tidak valid" });
    }

    try {
      const data = await ProgramSemester.query()
        .where("id", id)
        .preload("mapel", (m) => m.select("name"))
        .preload("teachers", (t) =>
          (t.preload("employee", (e) => e.select("name")), t.preload('teaching'))
        )
        .preload("programSemesterDetail", (prosemDetail) =>
          prosemDetail.select("*")
        )
        .preload("class", (c) => c.select("name", "id"))

        .firstOrFail();

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
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
    auth,
  }: HttpContextContract) {
    const { id } = params;

    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Program Semeter ID tidak valid" });
    }
    const user = await User.query()
      .where("id", auth?.user!.id)
      .preload("roles", (r) => r.preload("role"))
      .firstOrFail();
    const userObject = JSON.parse(JSON.stringify(user));

    const teacher = userObject.roles?.find((role) => role.role.name == "teacher");

    let payload;

    if (teacher) {
      const newProsemNonAdminSchema = schema.create({
        subjectId: schema.string.optional([
          rules.uuid({ version: 4 }),
          rules.exists({ table: "academic.subjects", column: "id" }),
        ]),
        classId: schema.string.optional([
          rules.uuid({ version: 4 }),
          rules.exists({ table: "academic.classes", column: "id" }),
        ]),
      });
      try {
        payload = await request.validate({ schema: newProsemNonAdminSchema });
      } catch (error) {
        return response.badRequest({
          message: "Buatlah prosem sesuai dengan mapel anda",
          error: error.message,
        });
      }
    } else {
      const newProsemAdminSchema = schema.create({
        teacherId: schema.string.optional([
          rules.uuid({ version: 4 }),
          rules.exists({ table: "academic.teachers", column: "id" }),
        ]),
        subjectId: schema.string.optional([
          rules.uuid({ version: 4 }),
          rules.exists({ table: "academic.subjects", column: "id" }),
        ]),

        classId: schema.string.optional([
          rules.uuid({ version: 4 }),
          rules.exists({ table: "academic.classes", column: "id" }),
        ]),
      });
      payload = await request.validate({ schema: newProsemAdminSchema });
    }

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

  public async duplicate({ request, response }: HttpContextContract) {
    const payload = await request.validate(DuplicateProsemValidator);
    const prosemDetailPayload = await ProgramSemesterDetail.query()
      .select("*")
      .where("programSemesterId", payload.prosemId);

    try {
      const prosemData = await ProgramSemester.create({
        subjectId: payload.subjectId,
        classId: payload.classId,
        teacherId: payload.teacherId,
      });

      const prosemDetail = prosemDetailPayload.map(
        (data: ProgramSemesterDetail) => {
          return {
            programSemesterId: prosemData.id,
            kompetensiIntiId: data.kompetensiIntiId,
            kompetensiDasar: data.kompetensiDasar,
            kompetensiDasarIndex: data.kompetensiDasarIndex,
            pertemuan: data.pertemuan,
            materi: data.materi,
            metode: data.metode,
            kategori1: data.kategori1,
            kategori2: data.kategori2,
            kategori3: data.kategori3,
          };
        }
      );

      const prosemDetailData = await ProgramSemesterDetail.createMany(
        prosemDetail
      );
      return response.ok({
        message: "Berhasil menduplikat data prosem",
        data: {
          program_semester: prosemData,
          program_semester_detail: prosemDetailData,
        },
      });
    } catch (error) {
      response.badRequest({
        message: "Gagal menduplikat data program semester",
        error: error,
      });
    }
  }

  public async noLogin({request, response}: HttpContextContract) {
    const {
      subjectId = "",
      classId = "", teacherId = ""
    } = request.qs()

    if (
      (subjectId && !uuidValidation(subjectId)) ||
      (classId && !uuidValidation(classId)) || (teacherId && !uuidValidation(teacherId))
    ) {
      return response.badRequest({
        message: "Subject ID atau Class ID atau Teacher ID tidak valid",
      });
    }

    try {
      
      const data = await ProgramSemester.query()
            .select("*")
            .withCount("programSemesterDetail", (q) => q.as("total_pertemuan"))
            .preload("teachers", (t) =>
              t.preload("employee", (e) => e.select("name"))
            )
            .preload("class", (c) => c.select("name", "id"))
            .if(subjectId, (q) => q.where("subjectId", subjectId))
            .if(teacherId, (q) =>
              q.where("teacherId", teacherId)
            )
            .if(classId, (q) => q.where("classId", classId))
            .preload("mapel", (m) => m.select("name"));

      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      response.badRequest({
        message: "Gagal mengambil data",
        error: error.message,
      });      
    }

  }
}
