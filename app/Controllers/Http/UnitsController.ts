import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Unit from "App/Models/Unit";
import CreateUnitValidator from "App/Validators/CreateUnitValidator";
import UpdateUnitValidator from "App/Validators/UpdateUnitValidator";
import { validate as uuidValidation } from "uuid"

export default class UnitsController {
  public async index({ request, response }: HttpContextContract) {
    // const dateStart = DateTime.now().toMillis();
    // CreateRouteHist(statusRoutes.START, dateStart);
    const { page = 1, limit = 10, keyword = "" } = request.qs();

    try {
      const data = await Unit.query()
        .preload("employeeUnits", (e) => {
          e.select("id", "title", "employee_id");
          e.preload("employee", (m) => m.select("name"));
          e.where("title", "=", "lead");
        })
        .whereILike("name", `%${keyword}%`)
        .orderBy('name', 'asc')
        .paginate(page, limit);

      // CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({ message: "Data Berhasil Didapatkan", data });
    } catch (error) {
      const message = "HRDU01: " + error.message || error;
      // CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateUnitValidator);
    try {
      const data = await Unit.create(payload);
      response.ok({ message: "Create data success", data });
    } catch (error) {
      const message = "HRDU02: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal create data",
        error: message,
        error_data: error,
      });
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Unit ID tidak valid" });
    }

    try {
      const data = await Unit.query()
        .preload("employeeUnits", (e) => {
          e.select("id", "title", "employee_id");
          e.preload("employee", (m) => m.select("name"));
        })
        .where("id", id)
        .firstOrFail();

      response.ok({ message: "Get data success", data });
    } catch (error) {
      const message = "HRDU03: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil detail data",
        error: message,
        error_data: error,
      });
    }
  }

  public async update({ request, response, params }: HttpContextContract) {
    const { id } = params;

    const payload = await request.validate(UpdateUnitValidator);

    try {
      const data = await Unit.findOrFail(id);
      await data.merge(payload).save();

      response.ok({ message: "Update data success", data });
    } catch (error) {
      const message = "HRDU04: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal update data",
        error: message,
        error_data: error,
      });
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params;
    try {
      const data = await Unit.findOrFail(id);
      await data.delete();

      response.ok({ message: "Delete data success" });
    } catch (error) {
      const message = "HRDU05: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }
}
