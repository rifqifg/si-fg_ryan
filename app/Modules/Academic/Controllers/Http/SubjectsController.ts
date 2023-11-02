import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import CreateSubjectValidator from "Academic/Validators/CreateSubjectValidator";
import Subject from "Academic/Models/Subject";
import { validate as uuidValidation } from "uuid";
import UpdateSubjectValidator from "../../Validators/UpdateSubjectValidator";
import { statusRoutes } from "App/Modules/Log/lib/enum";
import { CreateRouteHist } from "App/Modules/Log/Helpers/createRouteHist";
import { DateTime } from "luxon";

export default class SubjectsController {
  public async index({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis();
    CreateRouteHist(statusRoutes.START, dateStart);
    const {
      page = 1,
      limit = 10,
      keyword = "",
      mode = "page",
      classId = "",
      teacherId = "",
      isExtracurricular = false,
    } = request.qs();

    try {
      let data = {};
      if (mode === "page") {
        data = await Subject.query()

          .if(isExtracurricular, (q) =>
            q.where("is_extracurricular", isExtracurricular)
          )
          .whereILike("name", `%${keyword}%`)
          .orderBy("name")
          .paginate(page, limit);
      } else if (mode === "list") {
        data = await Subject.query()
          .if(classId && teacherId, (q) =>
            q.whereDoesntHave(
              "teaching",
              (th) => (
                th.where("class_id", classId), th.where("teacher_id", teacherId)
              )
            )
          )
          .whereILike("name", `%${keyword}%`)
          .orderBy("name");
        // if (classId !== "" && teacherId !== "") {
        //   data = await Subject.query()
        //     .whereDoesntHave("teaching", (th) => {
        //       th.where("teacher_id", "=", teacherId);
        //       th.where("class_id", "=", classId);
        //     })
        //     .if(isExtracurricular, (q) =>
        //       q.where("is_extracurricular", isExtracurricular)
        //     )
        //     .whereILike("name", `%${keyword}%`)
        //     .orderBy("name");
        // } else {
        //   data = await Subject.query()
        //     .if(isExtracurricular, (q) =>
        //       q.where("is_extracurricular", isExtracurricular)
        //     )
        //     .whereILike("name", `%${keyword}%`)
        //     .orderBy("name");
        // }
      } else {
        return response.badRequest({
          message: "Mode tidak dikenali, (pilih: page / list)",
        });
      }

      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "ACSU41: " + error.message || error;
      console.log(error);
      CreateRouteHist(statusRoutes.ERROR, dateStart, message);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis();
    CreateRouteHist(statusRoutes.START, dateStart);
    const payload = await request.validate(CreateSubjectValidator);
    try {
      const data = await Subject.create(payload);

      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.created({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      const message = "ACSU57: " + error.message || error;
      console.log(error);
      CreateRouteHist(statusRoutes.ERROR, dateStart, message);
      response.badRequest({
        message: "Gagal menyimpan data",
        error: message,
        error_data: error,
      });
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis();
    CreateRouteHist(statusRoutes.START, dateStart);
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Subject ID tidak valid" });
    }

    try {
      const data = await Subject.query().where("id", id).firstOrFail();

      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "ACSU77: " + error.message || error;
      console.log(error);
      CreateRouteHist(statusRoutes.ERROR, dateStart, message);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Subject ID tidak valid" });
    }

    const payload = await request.validate(UpdateSubjectValidator);
    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }
    try {
      const subject = await Subject.findOrFail(id);
      const data = await subject.merge(payload).save();
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "ACSU101: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengubah data",
        error: message,
        error_data: error,
      });
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Subject ID tidak valid" });
    }

    try {
      const data = await Subject.findOrFail(id);
      await data.delete();
      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      const message = "ACSU120: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }
}
