import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Leave from 'App/Models/Leave'
import CreateLeaveValidator from 'App/Validators/CreateLeaveValidator'
import { validate as uuidValidation } from "uuid"

export default class LeavesController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "" } = request.qs()

    try {
      const data = await Leave.query()
        .select('id', 'employee_id', 'status', 'reason', 'date', 'type')
        .preload('employee', em => em.select('name'))
        .whereHas('employee', e => e.whereILike('name', `%${keyword}%`))
        .paginate(page, limit)

      response.ok({ message: "Data Berhasil Didapatkan", data })
    } catch (error) {
      const message = "HRDLE01: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateLeaveValidator)

    try {
      const data = await Leave.create(payload);
      response.created({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      const message = "HRDLE02: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Subject ID tidak valid" });
    }

    try {
      const data = await Leave.query().where("id", id).firstOrFail();
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "HRDLE03: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

}
