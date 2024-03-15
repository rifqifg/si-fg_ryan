import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import CreateTeacherAttendanceValidator from "../../Validators/CreateTeacherAttendanceValidator";
import TeacherAttendance from "../../Models/TeacherAttendance";
const luxon_1 = require("luxon");
const hariIni = luxon_1.DateTime.now().toSQLDate().toString();
import { validate as uuidValidation } from "uuid";
import UpdateTeacherAttendanceValidator from "../../Validators/UpdateTeacherAttendanceValidator";
import Database from "@ioc:Adonis/Lucid/Database";
import Teacher from "../../Models/Teacher";
import User from "App/Models/User";
import LessonAttendance from "../../Models/LessonAttendance";
import { statusRoutes } from "App/Modules/Log/lib/enum";
import { CreateRouteHist } from "App/Modules/Log/Helpers/createRouteHist";
import { DateTime } from "luxon";
import { RolesHelper } from "App/Helpers/rolesHelper";

export default class TeacherAttendancesController {
  public async index({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart);
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
    try {
      const formattedStartDate = `${fromDate ? fromDate : hariIni
        } 00:00:00.000 +0700`;
      const formattedEndDate = `${toDate ? toDate : hariIni
        } 23:59:59.000 +0700`;

      const user = await User.query()
        .where("id", auth.user!.id)
        .preload("roles", (r) => r
          .preload('role'))
        .preload("employee", (e) => e
          .select('id', 'name', 'foundation_id')
          .preload("teacher", (t) => t
            .select("id")))
        .where('employee_id', auth.user!.$attributes.employeeId)
        .first();

      const userObject = JSON.parse(JSON.stringify(user));
      const roles = await RolesHelper(userObject)

      const teacher = userObject.roles.find(
        (role) => role.role_name === "teacher" || role.role_name === "user_academic"
      );

      let data = {};

      if (recap) {
        data = await TeacherAttendance.query()
          .select("teacher_id")
          .select(
            Database.raw(
              `sum(case when status = 'teach' then 1 else 0 end) as teach`
            ),
            Database.raw(
              `sum(case when status = 'not_teach' then 1 else 0 end) as not_teach`
            ),
            Database.raw(
              `sum(case when status = 'exam' then 1 else 0 end) as exam`
            ),
            Database.raw(
              `sum(case when status = 'homework' then 1 else 0 end) as homework`
            ),
            //TODO: menghitung persen status
            Database.raw(
              `round(cast(sum(case when status = 'teach' then 1 else 0 end) * 100.0 / (count(status))as decimal(10,2)),0) as teach_precentage`
            ),
            Database.raw(
              `round(cast(sum(case when status = 'not_teach' then 1 else 0 end) * 100.0 / (count(status))as decimal(10,2)),0) as not_teach_precentage`
            ),
            Database.raw(
              `round(cast(sum(case when status = 'exam' then 1 else 0 end) * 100.0 / (count(status))as decimal(10,2)),0) as exam_precentage`
            ),
            Database.raw(
              `round(cast(sum(case when status = 'homework' then 1 else 0 end) * 100.0 / (count(status))as decimal(10,2)),0) as homework_precentage`
            )
          )
          .whereBetween("date_in", [formattedStartDate, formattedEndDate])
          // .andWhereHas('teacher', t => t.whereHas('employee', e => e.whereILike("name", `%${keyword}%`)))
          .preload("teacher", (t) =>
            t.preload("employee", (e) => e.select("name"))
          )
          .if(!roles.includes('super_admin'), query => query
            .andWhereHas('teacher', t => t.whereHas('employee', e => e
              .whereILike("name", `%${keyword}%`)
              .where('foundation_id', user!.employee.foundationId)))
          )
          .if(roles.includes('super_admin') && foundationId, query => query
            .andWhereHas('teacher', t => t.whereHas('employee', e => e
              .whereILike("name", `%${keyword}%`)
              .where('foundation_id', foundationId)))
          )
          .groupBy("teacher_id")
          .paginate(page, limit);
      } else {
        data = await TeacherAttendance.query()
          .select("*")
          .whereBetween("date_in", [formattedStartDate, formattedEndDate])
          .if(keyword, (k) =>
            k.whereHas("teacher", (s) =>
              s.whereHas("employee", (e) => e.whereILike("name", `%${keyword}%`))
            )
          )
          .if(className, (c) =>
            c.whereHas("class", (s) => s.whereILike("name", `%${className}%`))
          )
          .if(subject, (s) =>
            s.whereHas("subject", (s) => s.whereILike("name", `%${subject}%`))
          )
          .if(session, (se) =>
            se.whereHas("session", (s) => s.whereILike("session", `%${session}%`))
          )
          .preload("teacher", (s) =>
            s.preload("employee", (e) => e.select("name"))
          )
          .preload("class", (c) => c.select("name"))
          .preload("session", (s) => s.select("session"))
          .preload("subject", (s) => s.select("name"))
          .preload("prosemDetail", (pd) => pd.select("materi", "kompetensiDasar"))
          .if(teacher, (q) => q.where("teacherId", user!.employee.teacher.id))
          .if(!roles.includes('super_admin'), query => query
            .whereHas('teacher', t => t.whereHas('employee', e => e
              .where('foundation_id', user!.employee.foundationId)))
          )
          .if(roles.includes('super_admin') && foundationId, query => query
            .whereHas('teacher', t => t.whereHas('employee', e => e
              .where('foundation_id', foundationId)))
          )
          .orderBy("date_in", "desc")
          .paginate(page, limit);
      }

      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: error.message || error,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart);

    try {
      const payload = await request.validate(CreateTeacherAttendanceValidator);

      // const user = await User.findBy("id", auth?.user?.id);
      // const teacher = await Teacher.findOrFail(payload.teacherId);
      // if (user?.role === "employee" && user?.employeeId !== teacher.employeeId) {
      //   return response.badRequest({
      //     message: "You dont have permission to store another user data",
      //   });
      // }

      // Cek duplikat data dengan kombinasi teacherId, subjectId, classId, sessionId dan date_out yg sama
      const duplicateTA = await TeacherAttendance.query()
        .where('teacher_id', payload.teacherId)
        .andWhere('subject_id', payload.subjectId)
        .andWhere('session_id', payload.sessionId)
        .andWhereRaw("date_in::date = ?", [payload.date_in.toFormat('yyyy-LL-dd')])
        .andWhereRaw("date_out::date = ?", [payload.date_out.toFormat('yyyy-LL-dd')])
        .if(payload.classId, q => q.andWhere('class_id', payload.classId!))
        .if((payload.classId === null), q => q.andWhereNull('class_id'))
        .first()

      if (duplicateTA) {
        return response.badRequest({ message: "Jurnal mengajar untuk guru, kelas, sesi dan tanggal ini sudah ada." })
      }

      const data = await TeacherAttendance.create(payload);

      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.created({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error);
      response.badRequest({
        message: "Gagal menyimpan data",
        error: error.message || error,
      });
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart);
    const { id } = params;

    if (!uuidValidation(id)) {
      return response.badRequest({
        message: "TeacherAttendance ID tidak valid",
      });
    }

    try {
      const data = await TeacherAttendance.query()
        .preload("teacher", (s) =>
          s.preload("employee", (e) => e.select("name"))
        )
        .preload("class", (c) => c.select("name"))
        .preload("session", (s) => s.select("session"))
        .preload("subject", (s) => s.select("name"))
        .where("id", id)
        .firstOrFail();

      const student = await LessonAttendance.query()
        .select("*")
        .preload(
          "student",
          (s) => (
            s.select("name", "classId"),
            s.preload("class", (c) => c.select("name"))
          )
        )
        .where("session_id", data.sessionId)
        .where("subject_id", data.subjectId)
        .where("date", `'${data.date_in}'`);

      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({
        message: "Berhasil mengambil data",
        data: { data, student },
      });
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: error.message || error,
      });
    }
  }

  public async update({
    params,
    request,
    response,
    auth,
  }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({
        message: "TeacherAttendance ID tidak valid",
      });
    }

    const payload = await request.validate(UpdateTeacherAttendanceValidator);
    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }

    const user = await User.query()
      .where("id", auth.user!.id)
      .preload("roles", (r) => r.select("*"))
      .preload("employee", (e) => e.preload("teacher", (t) => t.select("id")))
      .firstOrFail();

    const daily = await TeacherAttendance.findOrFail(id);

    // Cek duplikat data dengan kombinasi teacherId, subjectId, classId, sessionId dan date_out yg sama
    // const duplicateTA = await TeacherAttendance.query()
    //   // klo di payload ngga ada, ambil value dri 'daily'
    //   .if(payload.teacherId,
    //     q => q.where('teacher_id', payload.teacherId!),
    //     qElse => qElse.where('teacher_id', daily.teacherId)
    //   )
    //   .if(payload.subjectId,
    //     q => q.andWhere('subject_id', payload.subjectId!),
    //     qElse => qElse.andWhere('subject_id', daily.subjectId)
    //   )
    //   .if(payload.sessionId,
    //     q => q.andWhere('session_id', payload.sessionId!),
    //     qElse => qElse.andWhere('session_id', daily.sessionId)
    //   )
    //   .if(payload.date_in,
    //     q => q.andWhereRaw("date_in::date = ?", [payload.date_in!.toFormat('yyyy-LL-dd')]),
    //     qElse => qElse.andWhereRaw("date_in::date = ?", [daily.date_in.toFormat('yyyy-LL-dd')])
    //   )
    //   .if(payload.date_out,
    //     q => q.andWhereRaw("date_out::date = ?", [payload.date_out!.toFormat('yyyy-LL-dd')]),
    //     qElse => qElse.andWhereRaw("date_out::date = ?", [daily.date_out.toFormat('yyyy-LL-dd')])
    //   )
    //   .if(payload.classId,
    //     q => q.andWhere('class_id', payload.classId!),
    //     qElse => qElse.if(daily.classId,
    //         q => q.andWhere('class_id', daily.classId!),
    //         // klo di 'daily' jga ngga ada, cari yg null
    //         qElse => qElse.andWhereNull('class_id')
    //       )
    //   )
    //   .first()

    // if (duplicateTA) {
    //   return response.badRequest({ message: "Jurnal mengajar untuk guru, kelas, sesi dan tanggal ini sudah ada." })
    // }

    const teacher = await Teacher.findOrFail(daily.teacherId);

    const userObject = JSON.parse(JSON.stringify(user));

    if (
      userObject.roles.find((role) => role.role_name === "teacher" || role.role_name === "user_academic") &&
      user?.employeeId !== teacher.employeeId
    ) {
      return response.badRequest({
        message: "You dont have permission to update another user data",
      });
    }

    const data = await daily.merge(payload).save();

    response.ok({ message: "Berhasil mengubah data", data });
  }

  public async destroy({ params, response, auth }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({
        message: "TeacherAttendance ID tidak valid",
      });
    }
    const user = await User.query()
      .where('id', auth.user!.id)
      .preload('employee')
      .preload('roles')
      .firstOrFail()
    const data = await TeacherAttendance.findOrFail(id);
    const teacher = await Teacher.findOrFail(data.teacherId);
    const userObject = JSON.parse(JSON.stringify(user));

    if (
      userObject.roles.find((role) => role.role_name === "teacher" || role.role_name === "user_academic") &&
      user?.employeeId !== teacher.employeeId
    ) {
      return response.badRequest({
        message: "You dont have permission to delete another user data",
      });
    }

    await data.delete();

    response.ok({ message: "Berhasil menghapus data" });
  }
}
