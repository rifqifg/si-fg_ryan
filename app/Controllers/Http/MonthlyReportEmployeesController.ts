import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import MonthlyReportEmployee from 'App/Models/MonthlyReportEmployee';
import DeleteManyMonthlyReportEmployeeValidator from 'App/Validators/DeleteManyMonthlyReportEmployeeValidator';
import UpdateMonthlyReportEmployeeValidator from 'App/Validators/UpdateMonthlyReportEmployeeValidator';
import { validate as uuidValidation } from "uuid"

export default class MonthlyReportEmployeesController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", monthlyReportId } = request.qs()

    try {
      const data = await MonthlyReportEmployee.query()
        .preload('employee', em => em.select('name'))
        .whereHas('employee', e => e.whereILike('name', `%${keyword}%`))
        .andWhere('monthly_report_id', monthlyReportId)
        .paginate(page, limit)

      response.ok({ message: "Data Berhasil Didapatkan", data })
    } catch (error) {
      const message = "HRDMRE01: " + error.message || error;
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
      return response.badRequest({ message: "MonthlyReportEmployee ID tidak valid" });
    }

    const payload = await request.validate(UpdateMonthlyReportEmployeeValidator);
    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }
    try {
      const MRE = await MonthlyReportEmployee.findOrFail(id);
      const data = await MRE.merge(payload).save();
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

  public async destroy({ request, response }: HttpContextContract) {
    const payload = await request.validate(DeleteManyMonthlyReportEmployeeValidator)

    try {
      const monthlyReportEmployeeIds = payload.monthlyReportEmployees.map(sm => sm.monthlyReportEmployeeId)
      await MonthlyReportEmployee.query().whereIn("id", monthlyReportEmployeeIds).delete()

      response.ok({ message: 'Berhasil menghapus banyak data' })
    } catch (error) {
      const message = "HRDMRE03: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      })
    }
  }
}
