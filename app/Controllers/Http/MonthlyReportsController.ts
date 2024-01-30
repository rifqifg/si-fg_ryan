import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import MonthlyReport from 'App/Models/MonthlyReport'
import CreateMonthlyReportValidator from 'App/Validators/CreateMonthlyReportValidator'
import UpdateMonthlyReportValidator from 'App/Validators/UpdateMonthlyReportValidator'
import { validate as uuidValidation } from "uuid"
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'
import { DateTime } from 'luxon'
import { MonthlyReportHelper } from 'App/Helpers/MonthlyReportHelper'
import MonthlyReportEmployee from 'App/Models/MonthlyReportEmployee'
import { unitHelper } from 'App/Helpers/unitHelper'
import { checkRoleSuperAdmin } from 'App/Helpers/checkRoleSuperAdmin';
import Activity from 'App/Models/Activity'
import { validator, schema, rules } from '@ioc:Adonis/Core/Validator'
import EmployeeUnit from 'App/Models/EmployeeUnit'
import Notification from 'App/Models/Notification'

export default class MonthlyReportsController {
  public async index({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { page = 1, limit = 10, keyword = "", fromDate = "", toDate = "" } = request.qs()

    const unitIds = await unitHelper()
    const superAdmin = await checkRoleSuperAdmin()

    try {
      let data
      if (fromDate && toDate) {
        if (DateTime.fromISO(fromDate) > DateTime.fromISO(toDate)) {
          return response.badRequest({ message: "INVALID_DATE_RANGE" })
        }
        data = await MonthlyReport.query()
          .whereILike('name', `%${keyword}%`)
          .if(!(superAdmin), q => q.andWhereIn('unit_id', unitIds))
          .andWhere(query => {
            query.whereBetween('from_date', [fromDate, toDate])
            query.orWhereBetween('to_date', [fromDate, toDate])
          })
          .preload('unit')
          .paginate(page, limit)
      } else {
        data = await MonthlyReport.query()
          .whereILike('name', `%${keyword}%`)
          .preload('unit')
          .paginate(page, limit)
      }

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Data Berhasil Didapatkan", data })
    } catch (error) {
      const message = "HRDMR01: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const payload = await request.validate(CreateMonthlyReportValidator)

    if (payload.fromDate > payload.toDate) {
      return response.badRequest({ message: "INVALID_DATE_RANGE" })
    }

    const fixedTimeActivity = await Activity.query()
      .where('unit_id', payload.unitId)
      .andWhere('activity_type', 'fixed_time')

    if (fixedTimeActivity.length <= 0) throw new Error('Unit yang akan digenerate belum memiliki aktifitas tetap')

    // const superAdmin = await checkRoleSuperAdmin()

    // if (superAdmin) {
    //   if (!(payload.unitId)) throw new Error("Super admin wajib isi field unitId")
    // } else {
    //   const unitIds = await unitHelper()
    //   const body = request.body()

    //   request.updateBody({ ...body, unitId: unitIds[0]})
    // }

    // return request.body()

    // jika dia superadmin, ngga perlu ubah apa2.
    // cukup cek apakah field unitId nya diisi. klo ngga, bad request

    // jika dia bukan superadmin, panggil fungsi unitHelper..
    // ..masukkan nilai unitId[0] ke payload & request body.


    // TODO: handle jika payload.unitId nya ngga ada,
    // const newPayload = JSON.parse(JSON.stringify(payload))
    // const superAdmin = await checkRoleSuperAdmin()

    // if (!(superAdmin)) {
    //   const unitIds = await unitHelper()

    //   newPayload.unitId = unitIds[0]
    // }

    try {
      const data = await MonthlyReport.create(payload);

      // push notifikasi ke member unit masing2 bahwa rapot bulanan sudah dibuat
      const listEmployeeUnit = await EmployeeUnit.query()
        .where('unit_id', payload.unitId)
        .preload('employee', e => e
          .select('id')
          .preload('user', u => u.
            select('id')))

      const listEmployeeUnitObject = JSON.parse(JSON.stringify(listEmployeeUnit))

      let listPushnotif: any = { notifications: [] }
      listEmployeeUnitObject.map(value => {
        if (value.employee.user.id) {
          listPushnotif.notifications.push({
            title: "Rapot Bulanan",
            description: `Rapot ${payload.name} telah dibuat`,
            date: DateTime.now().setZone('Asia/Jakarta').toFormat('yyyy-MM-dd HH:mm:ss').toString(),
            type: "monthly_report",
            userId: value.employee.user.id
          })
        }
      })

      const CreateNotifValidator = await validator.validate({
        schema: schema.create({
          notifications: schema.array().members(
            schema.object().members({
              title: schema.string({}, [
                rules.minLength(3)
              ]),
              description: schema.string({}, [
                rules.minLength(3)
              ]),
              date: schema.date({ format: 'yyyy-MM-dd HH:mm:ss' }),
              type: schema.string(),
              userId: schema.string({}, [
                rules.exists({ table: 'users', column: 'id' })
              ])
            })
          )
        }),
        data: listPushnotif
      })

      await Notification.createMany(CreateNotifValidator.notifications)

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.created({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      const message = "HRDMR02: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal menyimpan data",
        error: message,
        error_data: error,
      });
    }
  }

  public async show({ params, response, request }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { page = 1, limit = 10, keyword = "", employeeId } = request.qs()

    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "MonthlyReport ID tidak valid" });
    }

    try {
      let data
      if (!employeeId) {
        const monthlyReport = await MonthlyReport.query()
          .select('name', 'from_date', 'to_date', 'red_dates', 'unit_id')
          .preload('unit')
          .where("id", id)
          .firstOrFail();

        data = await MonthlyReportEmployee.query()
          .select('*')
          .select(Database.raw(`(select name from employees e where id = employee_id) as employee_name`))
          .whereHas('monthlyReport', mr => mr.where('id', id))
          .preload('monthlyReport', mr => mr.select('name', 'from_date', 'to_date', 'red_dates'))
          .whereHas('employee', e => e.whereILike('name', `%${keyword}%`))
          .preload('employee', e => e
            .select('name', 'nik', 'status')
            .select(Database.raw(`EXTRACT(YEAR FROM AGE((select to_date from monthly_reports where id = '${id}'), "date_in")) || ' tahun ' || EXTRACT(MONTH FROM AGE((select to_date from monthly_reports where id = '${id}'), "date_in")) || ' bulan' AS period_of_work`))
            .preload('divisions', ds => ds.select("title", "divisionId").preload('division', d => d.select('name'))))
          .preload('monthlyReportEmployeesFixedTime', mreft => mreft
            .select('*')
            .select(Database.raw(`(case
                when skor * 100 / NULLIF((select default_presence from public.employees where id = (select employee_id from monthly_report_employees where id = monthly_report_employee_id)) - (select red_dates from monthly_reports where id = '${id}'), 0) > 100 then 100
                when skor * 100 / NULLIF((select default_presence from public.employees where id = (select employee_id from monthly_report_employees where id = monthly_report_employee_id)) - (select red_dates from monthly_reports where id = '${id}'), 0) <= 0 then 0
                else skor * 100 / NULLIF((select default_presence from public.employees where id = (select employee_id from monthly_report_employees where id = monthly_report_employee_id)) - (select red_dates from monthly_reports where id = '${id}'), 0)
                end) as percentage`))
            .select(Database.raw(`(select default_presence from public.employees where id= (select employee_id from monthly_report_employees where id = monthly_report_employee_id)) - (select red_dates from monthly_reports where id = '${id}') as "default"`))
            .whereHas('activity', ac => ac.where('activity_type', 'fixed_time').andWhere('assessment', true))
            .preload('activity', a => a.select('id', 'name', 'category_activity_id')
              .preload('categoryActivity', ca => ca.select('name'))))
          .preload('monthlyReportEmployeesNotFixedTime', mrenft => mrenft
            .select('*')
            .select(Database.raw(`(case
                when skor * 100 / NULLIF((select "default" from public.activities where id=activity_id), 0) > 100 then 100
                else skor * 100 / NULLIF((select "default" from public.activities where id=activity_id), 0)
                end) as percentage`))
            .select(Database.raw(`(select "default" from public.activities where id=activity_id) as "default"`))
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
            .select(Database.raw(`(case
                when skor * 100 / NULLIF((select total_mengajar from academic.teachers where employee_id =(select employee_id from monthly_report_employees where id = monthly_report_employee_id)), 0) > 100 then 100
                else skor * 100 / NULLIF((select total_mengajar from academic.teachers where employee_id =(select employee_id from monthly_report_employees where id = monthly_report_employee_id)), 0)
                end) as percentage`))
            .select(Database.raw(`(select total_mengajar from academic.teachers where employee_id =(select employee_id from monthly_report_employees where id = monthly_report_employee_id)) as "default"`))
            .where('is_teaching', true))
          .orderBy('employee_name')
          .paginate(page, limit)

        const dataArrayObject = JSON.parse(JSON.stringify(data))

        const result = await MonthlyReportHelper(dataArrayObject.data)

        CreateRouteHist(statusRoutes.FINISH, dateStart)
        return response.ok({ message: "Berhasil mengambil data", monthlyReport, data: { meta: dataArrayObject.meta, data: result } });
      } else {
        //buat module profile
        data = await MonthlyReport.query()
          .where("id", id)
          .preload('monthlyReportEmployees', mre => mre
            .whereHas('employee', e => e.where('employee_id', employeeId))
            .preload('monthlyReport', mr => mr.select('name', 'from_date', 'to_date'))
            .preload('employee', e => e
              .select('name', 'nik', 'status')
              .select(Database.raw(`EXTRACT(YEAR FROM AGE((select to_date from monthly_reports where id = '${id}'), "date_in")) || ' tahun ' || EXTRACT(MONTH FROM AGE((select to_date from monthly_reports where id = '${id}'), "date_in")) || ' bulan' AS period_of_work`))
              .preload('divisions', ds => ds.select("title", "divisionId").preload('division', d => d.select('name'))))
            .preload('monthlyReportEmployeesFixedTime', mreft => mreft
              .select('*')
              .select(Database.raw(`(case
                when skor * 100 / NULLIF((select default_presence from public.employees where id = '${employeeId}') - (select red_dates from monthly_reports where id = '${id}'), 0) > 100 then 100
                when skor * 100 / NULLIF((select default_presence from public.employees where id = '${employeeId}') - (select red_dates from monthly_reports where id = '${id}'), 0) <= 0 then 0
                else skor * 100 / NULLIF((select default_presence from public.employees where id = '${employeeId}') - (select red_dates from monthly_reports where id = '${id}'), 0)
                end) as percentage`))
              .select(Database.raw(`(select default_presence from public.employees where id='${employeeId}') - (select red_dates from monthly_reports where id = '${id}') as "default"`))
              .whereHas('activity', ac => ac.where('activity_type', 'fixed_time').andWhere('assessment', true))
              .preload('activity', a => a.select('id', 'name', 'category_activity_id')
                .preload('categoryActivity', ca => ca.select('name'))))
            .preload('monthlyReportEmployeesNotFixedTime', mrenft => mrenft
              .select('*')
              .select(Database.raw(`(case
                when skor * 100 / NULLIF((select "default" from public.activities where id=activity_id), 0) > 100 then 100
                else skor * 100 / NULLIF((select "default" from public.activities where id=activity_id), 0)
                end) as percentage`))
              .select(Database.raw(`(select "default" from public.activities where id=activity_id) as "default"`))
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
              .select(Database.raw(`(case
                when skor * 100 / NULLIF((select total_mengajar from academic.teachers where employee_id ='${employeeId}'), 0) > 100 then 100
                else skor * 100 / NULLIF((select total_mengajar from academic.teachers where employee_id ='${employeeId}'), 0)
                end) as percentage`))
              .select(Database.raw(`(select total_mengajar from academic.teachers where employee_id ='${employeeId}') as "default"`))
              .where('is_teaching', true)))
          .firstOrFail();

        const dataArray = JSON.parse(JSON.stringify(data)).monthlyReportEmployees

        const result = await MonthlyReportHelper(dataArray)
        const dataEmployee = result.dataEmployee
        const monthlyReportEmployeeDetail = result.monthlyReportEmployeeDetail
        // const monthlyReportEmployee = result.monthlyReportEmployee

        CreateRouteHist(statusRoutes.FINISH, dateStart)
        return response.ok({ message: "Berhasil mengambil data", dataEmployee, monthlyReportEmployeeDetail });
      }
    } catch (error) {
      const message = "HRDMR03: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
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
    if (payload.fromDate! > payload.toDate!) {
      return response.badRequest({ message: "INVALID_DATE_RANGE" })
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
