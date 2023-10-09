import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
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

  public async show({ params, response }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "MonthlyReportEmployee ID tidak valid" });
    }

    try {
      const getEmployeeId = await MonthlyReportEmployee.query()
        .select('employee_id')
        .where('id', id)
        .first()
      const employeeId = JSON.parse(JSON.stringify(getEmployeeId)).employee_id

      const data = await MonthlyReportEmployee.query()
        .where('id', id)
        .preload('monthlyReport', mr => mr.select('name', 'from_date', 'to_date'))
        .preload('employee', e => e
          .select('name', 'nik', 'status')
          .select(Database.raw(`EXTRACT(YEAR FROM AGE(NOW(), "date_in")) || ' tahun ' || EXTRACT(MONTH FROM AGE(NOW(), "date_in")) || ' bulan' AS period_of_work`))
          .preload('divisi', d => d.select('name')))
        .preload('monthlyReportEmployeesFixedTime', mreft => mreft
          .select('*')
          .select(Database.raw(`skor * 100 / (select default_presence from public.employees where id='${employeeId}') as percentage`))
          .whereHas('activity', ac => ac.where('activity_type', 'fixed_time').andWhere('assessment', true))
          .preload('activity', a => a.select('id', 'name', 'category_activity_id')
            .preload('categoryActivity', ca => ca.select('name'))))
        .preload('monthlyReportEmployeesNotFixedTime', mrenft => mrenft
          .select('*')
          .select(Database.raw(`skor * 100 / (select "default" from public.activities where id=activity_id) as percentage`))
          .whereHas('activity', ac => ac.where('activity_type', 'not_fixed_time').andWhere('assessment', true))
          .preload('activity', a => a.select('id', 'name', 'category_activity_id')
            .preload('categoryActivity', ca => ca.select('name'))))
        .preload('monthlyReportEmployeesLeave', mrel => mrel
          .select('*')
          .where('is_leave', true))

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
      const message = "HRDLE03: " + error.message || error;
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
      const message = "HRDMRE04: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      })
    }
  }
}
