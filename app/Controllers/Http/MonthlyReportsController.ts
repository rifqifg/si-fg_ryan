import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import MonthlyReport from 'App/Models/MonthlyReport'
import CreateMonthlyReportValidator from 'App/Validators/CreateMonthlyReportValidator'
import UpdateMonthlyReportValidator from 'App/Validators/UpdateMonthlyReportValidator'
import { validate as uuidValidation } from "uuid"

export default class MonthlyReportsController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", fromDate = "", toDate = "" } = request.qs()

    try {
      let data
      if (fromDate && toDate) {
        data = await MonthlyReport.query()
          .whereILike('name', `%${keyword}%`)
          .andWhere(query => {
            query.whereBetween('from_date', [fromDate, toDate])
            query.orWhereBetween('to_date', [fromDate, toDate])
          })
          .paginate(page, limit)
      } else {
        data = await MonthlyReport.query()
          .whereILike('name', `%${keyword}%`)
          .paginate(page, limit)
      }

      response.ok({ message: "Data Berhasil Didapatkan", data })
    } catch (error) {
      const message = "HRDMR01: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateMonthlyReportValidator)

    try {
      const data = await MonthlyReport.create(payload);
      response.created({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      const message = "HRDMR02: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal menyimpan data",
        error: message,
        error_data: error,
      });
    }
  }

  public async show({ params, response, request }: HttpContextContract) {
    const { keyword = "" } = request.qs()

    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "MonthlyReport ID tidak valid" });
    }

    try {
      const data = await MonthlyReport.query()
        .where("id", id)
        .preload('monthlyReportEmployees', mre => mre
          .whereHas('employee', e => e.whereILike('name', `%${keyword}%`))
          .preload('employee', e => e.select('name')))
        .firstOrFail();
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "HRDMR03: " + error.message || error;
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
      return response.badRequest({ message: "MonthlyReport ID tidak valid" });
    }

    const payload = await request.validate(UpdateMonthlyReportValidator);
    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }
    try {
      const monthlyReport = await MonthlyReport.findOrFail(id);
      const data = await monthlyReport.merge(payload).save();
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "HRDMR04: " + error.message || error;
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
      return response.badRequest({ message: "MonthlyReport ID tidak valid" });
    }

    try {
      const data = await MonthlyReport.findOrFail(id);
      await data.delete();
      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      const message = "HRDMR05: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }
}
