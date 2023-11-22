import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { validate as uuidValidation } from "uuid";
import StudentRaport from "App/Modules/Academic/Models/StudentRaport";
import { CreateRouteHist } from "App/Modules/Log/Helpers/createRouteHist";
import { statusRoutes } from "App/Modules/Log/lib/enum";
import { DateTime } from "luxon";
import UpdateStudentRaportValidator from "../../Validators/UpdateStudentRaportValidator";

export default class StudentRaportsController {
  public async index({request, response, params }: HttpContextContract) {
    const {keyword = ""} = request.qs()
    
    const dateStart = DateTime.now().toMillis();
    CreateRouteHist(statusRoutes.START, dateStart);
    const { raport_id: raportId } = params;

    if (!uuidValidation(raportId)) {
      return response.badRequest({ message: "Raport ID tidak valid" });
    }

    try {
      const data = await StudentRaport.query()
        .select("*")
        .where("raportId", raportId)
        .whereHas("student", q => q.whereILike('name', `%${keyword}%`))
        .preload(
          "student",
          (s) => (
            s.select("id", "name", "class_id"),
            s.preload("class", (c) => c.select("id", "name"))
          )
        );

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({
        message: "Berhasil mengambil data",
        data: data.sort((a, b) => {
          const nameA = a!.student!.name!.toUpperCase();
          const nameB = b!.student!.name!.toUpperCase();

          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        }),
      });
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: error.message || error,
      });
    }
  }

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async update({ request, response, params }: HttpContextContract) {
    const { id } = params;

    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Student Raport ID tidak valid" });
    }

    const payload = await request.validate(UpdateStudentRaportValidator);

    if (JSON.stringify(payload) === "{}") {
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }

    try {
      const studentRaport = await StudentRaport.findOrFail(id);
      const data = await studentRaport.merge(payload).save();

      response.ok({ message: "Berhasil memperbarui data", data });
    } catch (error) {
      response.badRequest({
        message: "Gagal memperbarui data",
        error: error.message || error,
      });
    }
  }

  public async destroy({}: HttpContextContract) {}
}
