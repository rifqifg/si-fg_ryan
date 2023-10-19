import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import MonthlyReport from 'App/Models/MonthlyReport'
import CreateMonthlyReportValidator from 'App/Validators/CreateMonthlyReportValidator'
import UpdateMonthlyReportValidator from 'App/Validators/UpdateMonthlyReportValidator'
import { validate as uuidValidation } from "uuid"
import { destructurMonthlyReport } from './MonthlyReportEmployeesController'

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
    const { keyword = "", employeeId } = request.qs()

    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "MonthlyReport ID tidak valid" });
    }

    try {
      let data
      if (!employeeId) {
        data = await MonthlyReport.query()
          .where("id", id)
          .preload('monthlyReportEmployees', mre => mre
            .preload('monthlyReport', mr => mr.select('name', 'from_date', 'to_date'))
            .whereHas('employee', e => e.whereILike('name', `%${keyword}%`))
            .preload('employee', e => e
              .select('name', 'nik', 'status')
              .select(Database.raw(`EXTRACT(YEAR FROM AGE(NOW(), "date_in")) || ' tahun ' || EXTRACT(MONTH FROM AGE(NOW(), "date_in")) || ' bulan' AS period_of_work`))
              .preload('divisi', d => d.select('name')))
            .preload('monthlyReportEmployeesFixedTime', mreft => mreft
              .select('*')
              .select(Database.raw(`skor * 100 / (select default_presence from public.employees where id= (select employee_id from monthly_report_employees where id = monthly_report_employee_id)) as percentage`))
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
            .preload('monthlyReportEmployeesLeaveSession', mrel => mrel
              .select('*')
              .where('is_leave_session', true))
            .preload('monthlyReportEmployeesTeaching', mret => mret
              .select('*')
              .select(Database.raw(`skor * 100 / (select total_mengajar from academic.teachers where employee_id =(select employee_id from monthly_report_employees where id = monthly_report_employee_id)) as percentage`))
              .where('is_teaching', true)))
          .firstOrFail();

        const dataArrayObject = JSON.parse(JSON.stringify(data)).monthlyReportEmployees
        let datas: any = []
        for (let i = 0; i < dataArrayObject.length; i++) {
          const result = await destructurMonthlyReport(dataArrayObject[i])
          const dataEmployee = result.dataEmployee
          const monthlyReportEmployeeDetail = result.monthlyReportEmployeeDetail
          const monthlyReportEmployee = result.monthlyReportEmployee
          datas.push({dataEmployee, monthlyReportEmployee, monthlyReportEmployeeDetail})
        }

        return response.ok({ message: "Berhasil mengambil data", data: datas });
      } else {
        data = await MonthlyReport.query()
          .where("id", id)
          .preload('monthlyReportEmployees', mre => mre
            .whereHas('employee', e => e.where('employee_id', employeeId))
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
            .preload('monthlyReportEmployeesLeaveSession', mrel => mrel
              .select('*')
              .where('is_leave_session', true))
            .preload('monthlyReportEmployeesTeaching', mret => mret
              .select('*')
              .select(Database.raw(`skor * 100 / (select total_mengajar from academic.teachers where employee_id ='${employeeId}') as percentage`))
              .where('is_teaching', true)))
          .firstOrFail();

        const dataObject = JSON.parse(JSON.stringify(data)).monthlyReportEmployees[0]

        const result = await destructurMonthlyReport(dataObject)
        const dataEmployee = result.dataEmployee
        const monthlyReportEmployeeDetail = result.monthlyReportEmployeeDetail
        const monthlyReportEmployee = result.monthlyReportEmployee

        return response.ok({ message: "Berhasil mengambil data", dataEmployee, monthlyReportEmployee, monthlyReportEmployeeDetail });
      }
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
