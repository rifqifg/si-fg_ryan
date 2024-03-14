import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Student from "Academic/Models/Student";
import CreateStudentValidator from "Academic/Validators/CreateStudentValidator";
import { validate as uuidValidation } from "uuid";
import UpdateStudentValidator from "Academic/Validators/UpdateStudentValidator";
import { statusRoutes } from "App/Modules/Log/lib/enum";
import { CreateRouteHist } from "App/Modules/Log/Helpers/createRouteHist";
import { DateTime } from "luxon";
import User from "App/Models/User";
import { RolesHelper } from "App/Helpers/rolesHelper";
import { checkRoleSuperAdmin } from "App/Helpers/checkRoleSuperAdmin";
import UpdateBatchStudentValidator from "../../Validators/UpdateBatchStudentValidator";
import Class from "../../Models/Class";

export default class StudentsController {
  public async index({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis();
    CreateRouteHist(statusRoutes.START, dateStart);
    const {
      page = 1,
      limit = 10,
      keyword = "",
      mode = "page",
      classId = "",
      isGraduated = false,
      notInSubject = "",
      subjectMember = "",
      isNew,
      foundationId
    } = request.qs();

    if (classId && !uuidValidation(classId)) {
      return response.badRequest({ message: "Class ID tidak valid" });
    }

    if (notInSubject && !uuidValidation(notInSubject)) {
      return response.badRequest({ message: "Subject ID tidak valid" });
    }

    if (subjectMember && !uuidValidation(subjectMember)) {
      return response.badRequest({ message: "Subject ID tidak valid" });
    }

    const graduated = isGraduated == "false" ? false : true;

    let user
    let roles: string[] = []
    if (auth.isLoggedIn) {
      user = await User.query()
        .preload('employee', e => e
          .select('id', 'name', 'foundation_id'))
        .preload('roles', r => r
          .preload('role'))
        .where('employee_id', auth.user!.$attributes.employeeId)
        .first()

      const userObject = JSON.parse(JSON.stringify(user))
      roles = await RolesHelper(userObject)
    }

    try {
      let data: object = {};
      if (mode === "page") {
        data = await Student.query()
          .select("*")
          .preload("class", (query) => query.select("name"))
          .preload("kelurahan")
          .preload("kecamatan")
          .preload("kota")
          .preload("provinsi")
          .preload('foundation', f => f.select('name'))
          .if(subjectMember, (sm) =>
            sm.whereHas("extracurricular", (ex) =>
              ex.where("subjectId", subjectMember)
            )
          )
          .if(notInSubject, (q) =>
            q.whereDoesntHave("extracurricular", (q) =>
              q.where("subjectId", notInSubject)
            )
          )
          .if(graduated, (g) => g.where("isGraduated", isGraduated))
          .if((isNew === "true"), (newStudentQuery) => newStudentQuery.doesntHave('class'))
          .andWhere((q) => {
            q.whereILike("name", `%${keyword}%`);
            q.orWhereILike("nis", `%${keyword}%`);
          })
          .if(classId, (c) => c.where("classId", classId))
          .if(!roles.includes('super_admin') && user, query => query
            .where('foundation_id', user!.employee.foundationId)
          )
          .if(roles.includes('super_admin') && foundationId && user, query => query
            .where('foundation_id', foundationId))
          .if(!auth.isLoggedIn && foundationId, query => query
            .where('foundation_id', foundationId))
          .orderBy("name")
          .paginate(page, limit);
      } else if (mode === "list") {
        data = await Student.query()
          .select("*")
          .preload("class", (query) => query.select("name"))
          .preload("kelurahan")
          .preload("kecamatan")
          .preload("kota")
          .preload("provinsi")
          .preload('foundation', f => f.select('name'))
          .if(subjectMember, (sm) =>
            sm.whereHas("extracurricular", (ex) =>
              ex.where("subjectId", subjectMember)
            )
          )
          .if(notInSubject, (q) =>
            q.whereDoesntHave("extracurricular", (q) =>
              q.where("subjectId", notInSubject)
            )
          )
          .if(graduated, (g) => g.where("isGraduated", isGraduated))
          .andWhere((q) => {
            q.whereILike("name", `%${keyword}%`);
            q.orWhereILike("nis", `%${keyword}%`);
          })
          .if(classId, (c) => c.where("classId", classId))
          .if(!roles.includes('super_admin') && user, query => query
            .where('foundation_id', user!.employee.foundationId)
          )
          .if(roles.includes('super_admin') && foundationId && user, query => query
            .where('foundation_id', foundationId))
          .if(!auth.isLoggedIn && foundationId, query => query
            .where('foundation_id', foundationId))
          .orderBy("name");
      } else {
        return response.badRequest({
          message: "Mode tidak dikenali, (pilih: page / list)",
        });
      }

      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      console.log(error);
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error);
      response.badRequest({ message: "Gagal mengambil data", error });
    }
  }

  public async store({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis();
    CreateRouteHist(statusRoutes.START, dateStart);
    const payload = await request.validate(CreateStudentValidator);
    try {
      const superAdmin = await checkRoleSuperAdmin()
      //kalo bukan superadmin maka foundationId nya di hardcode
      if (!superAdmin) {
        const user = await User.query()
          .preload('employee', e => e
            .select('id', 'name', 'foundation_id'))
          .where('employee_id', auth.user!.$attributes.employeeId)
          .first()

        payload.foundationId = user!.employee.foundationId
      }
      const data = await Student.create(payload);

      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.created({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      console.log(error);
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error);
      response.badRequest({
        message: "Gagal menyimpan data",
        error: error.message,
      });
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis();
    CreateRouteHist(statusRoutes.START, dateStart);
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Student ID tidak valid" });
    }

    try {
      const data = await Student.query()
        .preload("class", (query) => query.select("name"))
        .preload("kelurahan")
        .preload("kecamatan")
        .preload("kota")
        .preload("provinsi")
        .where("id", id)
        .preload('parents')
        .firstOrFail();

      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      console.log(error);
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: error.message,
      });
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Student ID tidak valid" });
    }

    const payload = await request.validate(UpdateStudentValidator);
    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }
    try {
      const student = await Student.findOrFail(id);
      const data = await student.merge(payload).save();
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      console.log(error);
      response.badRequest({
        message: "Gagal mengubah data",
        error: error.message,
      });
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Student ID tidak valid" });
    }

    try {
      const data = await Student.findOrFail(id);
      await data.delete();
      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: error.message,
      });
    }
  }

  public async updateStudents({ request, response }: HttpContextContract) {
    const payload = await request.validate(UpdateBatchStudentValidator);

    try {
      const data = await Student.updateOrCreateMany("id", payload.students)

      response.ok({ message: "Berhasil mengubah banyak data", data });
    } catch (error) {
      const message = "ACST06: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async studentNotInClass({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis();
    CreateRouteHist(statusRoutes.START, dateStart);
    const { page = 1, limit = 10, keyword = "", classId } = request.qs();

    if (classId && !uuidValidation(classId) || !classId) {
      return response.badRequest({ message: "Class ID tidak valid" });
    }

    try {
      const classs = await Class.query()
        .where('id', classId)
        .first()

      const data = await Student.query()
        .select('id', 'name', 'class_id')
        .where("isGraduated", false)
        .andWhereILike('name', `%${keyword}%`)
        .andWhere(query => query
          .where(builder => builder
            .whereNot('class_id', classs!.id)
            .orWhereNull('class_id')
          )
          .andWhere('foundation_id', classs!.foundationId)
        )
        .paginate(page, limit)

      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "ACST07: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }
}
