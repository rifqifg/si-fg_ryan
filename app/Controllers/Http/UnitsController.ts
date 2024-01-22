import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { checkRoleSuperAdmin } from "App/Helpers/checkRoleSuperAdmin";
import { unitHelper } from "App/Helpers/unitHelper";
import Unit from "App/Models/Unit";
import CreateUnitValidator from "App/Validators/CreateUnitValidator";
import UpdateUnitValidator from "App/Validators/UpdateUnitValidator";
import { validate as uuidValidation } from "uuid"

export default class UnitsController {
  public async index({ request, response }: HttpContextContract) {
    // const dateStart = DateTime.now().toMillis();
    // CreateRouteHist(statusRoutes.START, dateStart);
    const { page = 1, limit = 10, keyword = "" } = request.qs();
    const unitIds = await unitHelper()
    const superAdmin = await checkRoleSuperAdmin()

    try {
      const data = await Unit.query()
        .preload("employeeUnits", (e) => {
          e.select("id", "title", "employee_id");
          e.preload("employee", (m) => m.select("name"));
          e.where("title", "=", "lead");
        })
        .whereILike("name", `%${keyword}%`)
        .if(!superAdmin, query => {
          query.whereIn('id', unitIds)
        })
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

  public async show({ params, response, request }: HttpContextContract) {
    const { keyword = "" } = request.qs();
    const { id } = params;

    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Unit ID tidak valid" });
    }

    try {
      const data = await Unit.query()
        .where("id", id)
        .preload("employeeUnits", (e) => {
          e.select("id", "title", "employee_id", "status");
          e.preload("employee", (m) => m.select("name"));
          e.whereHas('employee', e => e.whereILike("name", `%${keyword}%`))
        })
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

  public async update({ request, response, params, auth }: HttpContextContract) {
    const { id } = params;

    const payload = await request.validate(UpdateUnitValidator);
    const superAdmin = await checkRoleSuperAdmin()

    if (!superAdmin) {
      //cek unit, apakah user yg login adalah lead atau bukan
      const checkUnit = await Unit.query()
        .whereHas('employeeUnits', eu => eu
          .where('employee_id', auth.user!.$attributes.employeeId)
          .andWhere('title', 'lead'))
        .first()

        if (!checkUnit || checkUnit.id != id) {
          return response.badRequest({ message: "Gagal mengubah data unit dikarenakan anda bukan ketua" });
        }
    }

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

  public async getUnit({ request, response }: HttpContextContract) {
    const { keyword = "" } = request.qs()

    try {
      const unitIds = await unitHelper()
      const superAdmin = await checkRoleSuperAdmin()

      const data = await Unit.query()
        .whereILike('name', `%${keyword}%`)
        .if(!superAdmin, query => {
          query.whereIn('id', unitIds)
          query.whereHas('employeeUnits', eu => eu.where('title', 'lead'))
        })

      response.ok({ message: "get data successfully", data })
    } catch (error) {
      const message = "HRDU06: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

}
