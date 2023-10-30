import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import MonthlyReportEmployeeDetail from 'App/Models/MonthlyReportEmployeeDetail';
import UpdateMonthlyReportEmployeeDetailValidator from 'App/Validators/UpdateMonthlyReportEmployeeDetailValidator';
import { validate as uuidValidation } from "uuid"

export default class MonthlyReportEmployeeDetailsController {
  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "MonthlyReportEmployeeDetail ID tidak valid" });
    }

    const payload = await request.validate(UpdateMonthlyReportEmployeeDetailValidator);
    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }
    try {
      const monthlyReportDetail = await MonthlyReportEmployeeDetail.findOrFail(id);
      const data = await monthlyReportDetail.merge(payload).save();
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
}
