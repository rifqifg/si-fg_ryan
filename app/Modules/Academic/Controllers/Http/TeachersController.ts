import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import CreateTeacherValidator from "../../Validators/CreateTeacherValidator";
import Teacher from "Academic/Models/Teacher";
import { validate as uuidValidation } from "uuid";
import UpdateTeacherValidator from "../../Validators/UpdateTeacherValidator";
import { statusRoutes } from "App/Modules/Log/lib/enum";
import { CreateRouteHist } from "App/Modules/Log/Helpers/createRouteHist";
import { DateTime } from "luxon";

//TODO: CRUD Teacher
export default class TeachersController {
  public async index({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis();
    CreateRouteHist(statusRoutes.START, dateStart);
    const { page = 1, limit = 10, keyword = "", mode = "page" } = request.qs();

    try {
      let data: any = {};
      if (mode === "page") {
        data = await Teacher.query()
          .whereHas("employee", (e) => e.whereILike("name", `%${keyword}%`))
          .orWhereHas("teaching", (t) =>
            t.whereHas("class", (c) => (c.whereILike("name", `%${keyword}%`)))
          ).orWhereHas("teaching", (t) =>
          t.whereHas("class", (c) => ( c.where('is_graduated', false)))
        )
          .orWhereHas("teaching", (t) =>
            t.whereHas("subject", (s) => s.whereILike("name", `%${keyword}%`))
          )
          .preload("employee", (e) => e.select("id", "name", "nip"))
          .preload("teaching", (t) =>
            t
              .select("id", "class_id", "subject_id")
              .preload("class", (c) => c.select("id", "name", "is_graduated"))
              .preload("subject", (s) =>
                s.select("id", "name", "is_extracurricular")
              )
          )
          .paginate(page, limit);

      } else if (mode === "list") {
        data = await Teacher.query()
          .whereHas("employee", (e) => e.whereILike("name", `%${keyword}%`))
          .orWhereHas("teaching", (t) =>
            t.whereHas("class", (c) => c.whereILike("name", `%${keyword}%`))
          )
          .orWhereHas("teaching", (t) =>
            t.whereHas("subject", (s) => s.whereILike("name", `%${keyword}%`))
          )
          .preload("employee", (e) => e.select("id", "name", "nip"))
          .preload("teaching", (t) =>
            t
              .select("id", "class_id", "subject_id")
              .preload("class", (c) => c.select("id", "name"))
              .preload("subject", (s) =>
                s.select("id", "name", "is_extracurricular")
              )
          );
      } else {
        return response.badRequest({
          message: "Mode tidak dikenali, (pilih: page / list)",
        });
      }

      
      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "ACSU46: " + error.message || error;
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
    const payload = await request.validate(CreateTeacherValidator);
    try {
      const data = await Teacher.create(payload);

      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.created({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      const message = "ACTE63: " + error.message || error;
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
      return response.badRequest({ message: "Teacher ID tidak valid" });
    }

    try {
      const data = await Teacher.query()
        .preload("employee", (e) => e.select("id", "name", "nip"))
        .preload("teaching", (t) =>
          t
            .select("id", "class_id", "subject_id")
            .preload("class", (c) => c.select("id", "name"))
            .preload("subject", (s) => s.select("id", "name"))
        )
        .preload("employee", (query) =>
          query.preload("divisions", (d) =>
            d.preload("division", (x) => x.select("name"))
          )
        )
        .where("id", id)
        .firstOrFail();

      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "ACTE92: " + error.message || error;
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
      return response.badRequest({ message: "Teacher ID tidak valid" });
    }

    const payload = await request.validate(UpdateTeacherValidator);

    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }

    try {
      const teacher = await Teacher.findByOrFail("id", id);
      const data = await teacher.merge(payload).save();

      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      response.badRequest({
        message: "Gagal mengubah data",
        error: error.message,
      });
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Teacher ID tidak valid" });
    }

    try {
      const data = await Teacher.findOrFail(id);
      await data.delete();
      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      const message = "ACTE111: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }
}
