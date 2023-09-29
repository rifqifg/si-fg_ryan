import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import EmployeeType from 'App/Models/EmployeeType'
import CreateEmployeeTypeValidator from 'App/Validators/CreateEmployeeTypeValidator'
import UpdateEmployeeTypeValidator from 'App/Validators/UpdateEmployeeTypeValidator'

export default class EmployeeTypesController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "" } = request.qs()
    try {
      const data = await EmployeeType.query()
        .whereILike('name', `%${keyword}%`)
        .paginate(page, limit)

      response.ok({
        message: "Berhasil mengambil data",
        data
      })
    } catch (error) {
      const message = "HRDET01: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  //TODO: bikin crud
  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateEmployeeTypeValidator)

    try {
      const data = await EmployeeType.create(payload);
      response.created({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      const message = "HRDET02: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async show({ }: HttpContextContract) { }

  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params;

    const payload = await request.validate(UpdateEmployeeTypeValidator);
    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }
    try {
      const employeeType = await EmployeeType.findOrFail(id);
      const data = await employeeType.merge(payload).save();
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "HRDET03: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengubah data",
        error: message,
        error_data: error,
      });
    }
  }

  public async destroy({params, response}: HttpContextContract) {
    const { id } = params;

    try {
      const data = await EmployeeType.findOrFail(id);
      await data.delete();
      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      const message = "HRDET04: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }
}
