import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import CreateLessonAttendanceValidator from "../../Validators/CreateLessonAttendanceValidator";
import LessonAttendance from "../../Models/LessonAttendance";
const luxon_1 = require("luxon");
const hariIni = luxon_1.DateTime.now().toSQLDate().toString();
import { validate as uuidValidation } from "uuid";
import UpdateLessonAttendanceValidator from "../../Validators/UpdateLessonAttendanceValidator";
import Database from "@ioc:Adonis/Lucid/Database";
import { statusRoutes } from "App/Modules/Log/lib/enum";
import { CreateRouteHist } from "App/Modules/Log/Helpers/createRouteHist";
import { DateTime } from "luxon";
import { RolesHelper } from "App/Helpers/rolesHelper";
import User from "App/Models/User";

export default class LessonAttendancesController {
  public async index({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const {
      page = 1,
      limit = 10,
      keyword = "",
      fromDate = hariIni,
      toDate = hariIni,
      recap = false,
      className = "",
      subject = "",
      session = "",
      foundationId
    } = request.qs();
    const formattedStartDate = `${
      fromDate ? fromDate : hariIni
    } 00:00:00.000 +0700`;
    const formattedEndDate = `${toDate ? toDate : hariIni} 23:59:59.000 +0700`;

    let data = {};

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
    if (recap && recap !== "false") {
      data = await LessonAttendance.query()
        .select(
          "academic.lesson_attendances.subject_id",
          "lesson_attendances.student_id"
        )
        .leftJoin("academic.students as s", "s.id", "student_id")
        .leftJoin("academic.classes as c", "c.id", "s.class_id")
        .select(
          Database.raw(
            `sum(case when status = 'present' then 1 else 0 end) as present`
          ),
          Database.raw(
            `sum(case when status = 'permission' then 1 else 0 end) as permission`
          ),
          Database.raw(
            `sum(case when status = 'sick' then 1 else 0 end) as sick`
          ),
          Database.raw(
            `sum(case when status = 'absent' then 1 else 0 end) as absent`
          ),
          //TODO: menghitung persen status
          Database.raw(
            `round(cast(sum(case when status = 'present' then 1 else 0 end) * 100.0 / (count(status))as decimal(10,2)),0) as present_precentage`
          ),
          Database.raw(
            `round(cast(sum(case when status = 'permission' then 1 else 0 end) * 100.0 / (count(status))as decimal(10,2)),0) as permission_precentage`
          ),
          Database.raw(
            `round(cast(sum(case when status = 'sick' then 1 else 0 end) * 100.0 / (count(status))as decimal(10,2)),0) as sick_precentage`
          ),
          Database.raw(
            `round(cast(sum(case when status = 'absent' then 1 else 0 end) * 100.0 / (count(status))as decimal(10,2)),0) as absent_precentage`
          )
        )
        .whereBetween("lesson_attendances.date", [
          formattedStartDate,
          formattedEndDate,
        ])
        .if(keyword, (k) =>
          k.whereHas("student", (s) => s.whereILike("name", `%${keyword}%`))
        )
        .if(className, (c) => c.where("c.name", className))
        .if(subject, (su) =>
          su.whereHas("subject", (s) => s.whereILike("name", `%${subject}%`))
        )
        .if(session, (se) =>
          se.whereHas("session", (s) => s.whereILike("session", `%${session}%`))
        )
        .if(!roles.includes('super_admin'), query =>
          query.whereHas('student', s => s.where('foundation_id', user!.employee.foundationId))
        )
        .if(roles.includes('super_admin') && foundationId, query =>
          query.whereHas('student', s => s.where('foundation_id', foundationId))
        )
        .preload(
          "student",
          (st) => (
            st.select("name", "classId"),
            st.preload("class", (c) => c.select("name"))
          )
        )
        // .preload("class", (c) => c.select("name").withCount("students"))
        .preload("subject", (s) => s.select("name"))
        .groupBy(
          "lesson_attendances.subject_id",
          "lesson_attendances.student_id"
        )
        .paginate(page, limit);

        CreateRouteHist(statusRoutes.FINISH, dateStart);
      return response.ok({ message: "Berhasil mengambil data", data });
    }

    data = await LessonAttendance.query()
      .select("academic.lesson_attendances.*")
      .leftJoin(
        "academic.students as s",
        "s.id",
        "academic.lesson_attendances.student_id"
      )
      .leftJoin("academic.classes as c", "c.id", "s.class_id")
      .whereBetween("date", [formattedStartDate, formattedEndDate])
      .if(keyword, (k) =>
        k.whereHas("student", (s) => s.whereILike("name", `%${keyword}%`))
      )
      // .if(className, (c) =>
      //   c.whereHas("class", (s) => s.whereILike("name", `%${className}%`))
      // )
      .if(className, (c) => c.where("c.name", className))
      .if(subject, (su) =>
        su.whereHas("subject", (s) => s.whereILike("name", `%${subject}%`))
      )
      .if(session, (se) =>
        se.whereHas("session", (s) => s.whereILike("session", `%${session}%`))
      )
      .if(!roles.includes('super_admin'), query =>
        query.whereHas('student', s => s.where('foundation_id', user!.employee.foundationId))
      )
      .if(roles.includes('super_admin') && foundationId, query =>
        query.whereHas('student', s => s.where('foundation_id', foundationId))
      )
      .preload(
        "student",
        (s) => (
          s.select("name", "classId"),
          s.preload("class", (c) => c.select("name"))
        )
      )
      .preload("session", (s) => s.select("session"))
      .preload("subject", (s) => s.select("name"))
      .orderByRaw(`(case when academic.lesson_attendances.status = 'sick' then concat('1-', academic.lesson_attendances.status)
      when academic.lesson_attendances.status = 'permission' then concat('2-', academic.lesson_attendances.status)
      when academic.lesson_attendances.status = 'absent' then concat('3-', academic.lesson_attendances.status)
      when academic.lesson_attendances.status = 'present' then concat('4-', academic.lesson_attendances.status)
    end), c.name, academic.lesson_attendances.description`)
      .orderBy("c.name")
          .orderBy("academic.lesson_attendances.created_at")
          .orderBy("s.name")
      .orderBy("date", "desc")
      .paginate(page, limit);
      CreateRouteHist(statusRoutes.FINISH, dateStart);
    response.ok({ message: "Berhasil mengambil data", data });
  } catch (error) {
    CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)

    response.badRequest({message: "Gagal mengambil data", error: error.message || error})
  }
  }

  public async store({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)

    try {

      const payload = await request.validate(CreateLessonAttendanceValidator);

      // return payload.lessonAttendance
      const data = await LessonAttendance.createMany(payload.lessonAttendance);
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.created({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)

      response.badRequest({message: "Gagal menyimpan data", error: error.message || error})
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { id } = params;

    try {

      if (!uuidValidation(id)) {
        return response.badRequest({ message: "DailyAttendance ID tidak valid" });
      }

      const data = await LessonAttendance.query()
        .preload(
          "student",
          (s) => (
            s.select("name", "classId"),
            s.preload("class", (c) => c.select("name"))
          )
        )
        .preload("session", (s) => s.select("session"))
        .preload("subject", (s) => s.select("name"))
        .where("id", id)
        .firstOrFail();
        CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      response.badRequest({message: "Gagal mengambil data", error: error.message || error})
    }

  }

  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({
        message: "LessonAttendance ID tidak valid",
      });
    }

    const payload = await request.validate(UpdateLessonAttendanceValidator);
    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }

    const daily = await LessonAttendance.findOrFail(id);
    const data = await daily.merge(payload).save();

    response.ok({ message: "Berhasil mengubah data", data });
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({
        message: "LessonAttendance ID tidak valid",
      });
    }

    const data = await LessonAttendance.findOrFail(id);
    await data.delete();

    response.ok({ message: "Berhasil menghapus data" });
  }
}
