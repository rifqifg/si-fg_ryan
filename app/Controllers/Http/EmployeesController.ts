import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Employee from "App/Models/Employee";
import CreateEmployeeValidator from "App/Validators/CreateEmployeeValidator";
import UpdateEmployeeValidator from "App/Validators/UpdateEmployeeValidator";

export default class EmployeesController {
  public async index({ request, response }: HttpContextContract) {
    const {
      page = 1,
      limit = 10,
      keyword = "",
      employeeTypeId = "",
      divisionId = "",
      orderBy = "name",
      orderDirection = "ASC",
    } = request.qs();
    // TODO: filter by division
    const data = await Employee.query()
      .select("*")
      .if(employeeTypeId, (e) => e.where("employeeTypeId", employeeTypeId))
      .preload(
        "divisions",
        (d) => (
          d.select("title", "divisionId"),
          d.preload("division", (x) => x.select("name"))
        )
      )
      .if(divisionId, d => d.whereHas("divisions", (q) => q.where("divisionId", "=", divisionId)) )
      .preload("provinsi")
      .preload("kota")
      .preload("kecamatan")
      .preload("kelurahan")
      .andWhere((query) => {
        query.whereILike("name", `%${keyword}%`);
        query.orWhereILike("nik", `%${keyword}%`);
        query.orWhereILike("nip", `%${keyword}%`);
        // query.orWhereILike("division", `%${keyword}%`);
      })
      .orderBy(orderBy, orderDirection)
      .paginate(page, limit);

    response.ok({ message: "Data Berhasil Didapatkan", data });
  }

  public async getEmployee({ request, response }: HttpContextContract) {
    const {
      keyword = "",
      employeeTypeId = "",
      orderBy = "name",
      orderDirection = "ASC",
    } = request.qs();

    const data = await Employee.query()
      .select("*")
      .if(employeeTypeId, (e) => e.where("employeeTypeId", employeeTypeId))
      .preload(
        "divisions",
        (d) => (
          d.select("title", "divisionId"),
          d.preload("division", (x) => x.select("name"))
        )
      )
      .preload("provinsi")
      .preload("kota")
      .preload("kecamatan")
      .preload("kelurahan")
      .andWhere((query) => {
        query.whereILike("name", `%${keyword}%`);
        query.orWhereILike("nik", `%${keyword}%`);
        query.orWhereILike("nip", `%${keyword}%`);
        // query.orWhereILike("division", `%${keyword}%`);
      })
      .orderBy(orderBy, orderDirection);
    response.ok({ message: "Data Berhasil Didapatkan", data });
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateEmployeeValidator);

    try {
      const data = await Employee.create(payload);

      response.ok({ message: "Create data success", data });
    } catch (error) {
      console.log(error);
      return response.internalServerError(error);
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params;
    try {
      const data = await Employee.query()
        .select("*")
        .preload("divisions", (d) =>
          d.preload("division", (x) => x.select("name"))
        )
        .preload("provinsi")
        .preload("kota")
        .preload("kecamatan")
        .preload("kelurahan")
        .preload(
          "divisions",
          (d) => (
            d.select("title", "divisionId"),
            d.preload("division", (x) => x.select("name"))
          )
        )
        .where("id", id);
      response.ok({ message: "Get data success", data });
    } catch (error) {
      console.log(error);
      return response.internalServerError(error);
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params;

    const payload = await request.validate(UpdateEmployeeValidator);
    if (payload.kodeProvinsi === null) {
      payload["kodeKota"] = null;
      payload["kodeKecamatan"] = null;
      payload["kodeKelurahan"] = null;
    }

    try {
      const data = await Employee.findOrFail(id);
      await data.merge(payload).save();

      response.ok({ message: "Update data success", data });
    } catch (error) {
      console.log(error);
      response.internalServerError(error);
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params;
    try {
      const data = await Employee.findOrFail(id);
      await data.delete();

      response.ok({ message: "Delete data success" });
    } catch (error) {
      console.log(error);
      response.internalServerError(error);
    }
  }
}
