import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Leave from 'App/Models/Leave'
import CreateLeaveValidator from 'App/Validators/CreateLeaveValidator'
import UpdateLeaveValidator from 'App/Validators/UpdateLeaveValidator'
import { validate as uuidValidation } from "uuid"

export default class LeavesController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", fromDate = "", toDate = "" } = request.qs()

    try {
      let data
      if (fromDate && toDate) {
        data = await Leave.query()
          .select('id', 'employee_id', 'status', 'reason', 'from_date', 'to_date', 'type')
          .preload('employee', em => em.select('name'))
          .whereHas('employee', e => e.whereILike('name', `%${keyword}%`))
          .whereBetween('from_date', [fromDate, toDate])
          .orWhereBetween('to_date', [fromDate, toDate])
          .paginate(page, limit)
      } else {
        data = await Leave.query()
          .select('id', 'employee_id', 'status', 'reason', 'from_date', 'to_date', 'type')
          .preload('employee', em => em.select('name'))
          .whereHas('employee', e => e.whereILike('name', `%${keyword}%`))
          .paginate(page, limit)
      }

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
      return response.badRequest({ message: "Leave ID tidak valid" });
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

  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Leave ID tidak valid" });
    }

    const payload = await request.validate(UpdateLeaveValidator);
    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }
    try {
      const leave = await Leave.findOrFail(id);
      const data = await leave.merge(payload).save();
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "HRDLE04: " + error.message || error;
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
      return response.badRequest({ message: "Leave ID tidak valid" });
    }

    try {
      const data = await Leave.findOrFail(id);
      await data.delete();
      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      const message = "HRDLE05: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }

}
