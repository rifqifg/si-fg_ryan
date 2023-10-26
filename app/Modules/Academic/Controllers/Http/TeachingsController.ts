import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import CreateTeachingValidator from "../../Validators/CreateTeachingValidator";
import Teaching from "../../Models/Teaching";
import { validate as uuidValidation } from "uuid";
import UpdateTeachingValidator from "../../Validators/UpdateTeachingValidator";
import { statusRoutes } from "App/Modules/Log/lib/enum";
import { CreateRouteHist } from "App/Modules/Log/Helpers/createRouteHist";

export default class TeachingsController {
  public async index({ request, response, params }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const { teacher_id } = params;
    const { subjectId = "", classId = "" } = request.qs();
    if (!uuidValidation(teacher_id)) {
      return response.badRequest({ message: "Teacher ID tidak valid" });
    }

    if (subjectId && !uuidValidation(subjectId)) {
      return response.badRequest({ message: "Subject ID tidak valid" });
    }

    if (classId && !uuidValidation(classId)) {
      return response.badRequest({ message: "Class ID tidak valid" });
    }

    try {
      let data = {};

      data = await Teaching.query()
        .select("academic.teachings.*")
        .preload("class", (c) => c.select("id", "name"))
        .preload("subject", (s) => s.select("id", "name", "is_extracurricular"))
        .if(subjectId && classId, (q) =>
          q.andWhere((q) => {
            q.where("subject_id", subjectId);
            q.whereNot("class_id", classId);
          })
        )
        .if(classId, (q) => q.whereNot("class_id", classId))
        .andWhere((q) => {
          q.andWhereHas("class", (c) => c.where("is_graduated", false));
          q.orWhereHas("subject", (s) => s.where("is_extracurricular", true));
        })
        .where("academic.teachings.teacher_id", "=", teacher_id);

      CreateRouteHist(request, statusRoutes.FINISH)
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "ACTH23: " + error.message || error;
      CreateRouteHist(request, statusRoutes.ERROR, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const payload = await request.validate(CreateTeachingValidator);
    try {
      const data = await Teaching.create(payload);

      CreateRouteHist(request, statusRoutes.FINISH)
      response.created({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      const message = "ACTH40: " + error.message || error;
      console.log(error);
      CreateRouteHist(request, statusRoutes.ERROR, message)
      response.badRequest({
        message: "Gagal menyimpan data",
        error: message,
        error_data: error,
      });
    }
  }

  public async show({request, params, response }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Teaching ID tidak valid" });
    }

    try {
      const data = await Teaching.query()
        .preload("class", (c) => c.select("*"))
        .preload("subject", (s) => s.select("*"))
        .where("id", "=", id)
        .firstOrFail();
      
        CreateRouteHist(request, statusRoutes.FINISH)
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "ACTH62: " + error.message || error;
      console.log(error);
      CreateRouteHist(request, statusRoutes.ERROR, message)
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
      return response.badRequest({ message: "Teaching ID tidak valid" });
    }

    const payload = await request.validate(UpdateTeachingValidator);
    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }
    try {
      const teaching = await Teaching.findOrFail(id);
      const data = await teaching.merge(payload).save();
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "ACTH86: " + error.message || error;
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
      return response.badRequest({ message: "Teaching ID tidak valid" });
    }

    try {
      const data = await Teaching.findOrFail(id);
      await data.delete();
      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      const message = "ACSU105: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }
}
