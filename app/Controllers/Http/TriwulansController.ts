import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { TriwulanHelper } from 'App/Helpers/TriwulanHelper'
import { checkRoleSuperAdmin } from 'App/Helpers/checkRoleSuperAdmin'
import { unitHelper } from 'App/Helpers/unitHelper'
import Triwulan from 'App/Models/Triwulan'
import TriwulanEmployee from 'App/Models/TriwulanEmployee'
import TriwulanEmployeeDetail from 'App/Models/TriwulanEmployeeDetail'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'
import CreateTriwulanValidator from 'App/Validators/CreateTriwulanValidator'
import UpdateTriwulanValidator from 'App/Validators/UpdateTriwulanValidator'
import { DateTime } from 'luxon'
import { validate as uuidValidation } from "uuid"

export default class TriwulansController {
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
        data = await Triwulan.query()
          .whereILike('name', `%${keyword}%`)
          .andWhere(query => {
            query.whereBetween('from_date', [fromDate, toDate])
            query.orWhereBetween('to_date', [fromDate, toDate])
          })
          .if(!superAdmin, query => {
            query.whereIn('unit_id', unitIds)
          })
          .paginate(page, limit)
      } else {
        data = await Triwulan.query()
          .whereILike('name', `%${keyword}%`)
          .if(!superAdmin, query => {
            query.whereIn('unit_id', unitIds)
          })
          .paginate(page, limit)
      }

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Data Berhasil Didapatkan", data })
    } catch (error) {
      const message = "HRDTW01: " + error.message || error;
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
    const payload = await request.validate(CreateTriwulanValidator)

    if (payload.fromDate > payload.toDate) {
      return response.badRequest({ message: "INVALID_DATE_RANGE" })
    }

    try {
      const data = await Triwulan.create(payload);
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.created({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      const message = "HRDTW02: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async show({ request, response, params }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { page = 1, limit = 10, keyword = "", employeeId } = request.qs()

    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Triwulan ID tidak valid" });
    }

    let data

    try {
      if (!employeeId) {
        const triwulan = await Triwulan.query()
          .where('id', id)
          .firstOrFail()

        data = await TriwulanEmployee.query()
          .with('AggregatedData', query => {
            query
              .select('te.*')
              .select(Database.raw(`SUM(ted.skor) AS total_skor`))
              .select(Database.raw(`(select sum(skor) from triwulan_employee_details where triwulan_id = '${id}' and direct_supervisor = true and triwulan_employee_id = te.id) as total_skor_direct_supervisor`))
              .select(Database.raw(`(select sum(skor) from triwulan_employee_details where triwulan_id = '${id}' and direct_supervisor = false and triwulan_employee_id = te.id) as total_skor_indirect_supervisor`))
              .select(Database.raw(`(select TO_CHAR(from_date, 'Mon') || ' - ' || TO_CHAR(to_date, 'Mon YY') FROM triwulans where id = '${id}') AS period_of_assessment`))
              .select(Database.raw(`RANK() OVER (ORDER BY SUM(ted.skor) DESC) AS ranking`))
              .select(Database.raw(`(select name from employees e where id = te.employee_id) as employee_name`))
              .from(`triwulan_employees as te`)
              .where('triwulan_id', id)
              .joinRaw(`LEFT JOIN triwulan_employee_details ted ON ted.triwulan_employee_id = te.id`)
              .groupBy('te.id')
          })
          .preload('employee', e => e
            .select('id', 'name', 'nik')
            .select(Database.raw(`EXTRACT(YEAR FROM AGE((select to_date from triwulans where id = '${id}'), "date_in")) || ' tahun ' || EXTRACT(MONTH FROM AGE((select to_date from triwulans where id = '${id}'), "date_in")) || ' bulan' AS period_of_work`))
            .preload('divisions', ds => ds.select("title", "divisionId")
              .preload('division', d => d.select('name'))))
          .preload('triwulanEmployeeDetail', ted => ted
            .preload('assessmentComponent', ac => ac.select('name')))
          .select('*')
          .from('AggregatedData')
          .whereILike('employee_name', `%${keyword}%`)
          .orderBy('employee_name')
          .paginate(page, limit)

        const dataArrayObject = JSON.parse(JSON.stringify(data))

        let datas: any = []
        for (let i = 0; i < dataArrayObject.data.length; i++) {
          const result = await TriwulanHelper(dataArrayObject.data[i])
          const dataEmployee = { ...result.dataEmployee, triwulan: dataArrayObject.name }
          const triwulanEmployee = result.triwulanEmployee
          const triwulanEmployeeDetail = result.triwulanEmployeeDetail
          const penilai = result.penilai
          datas.push({ dataEmployee, triwulanEmployee, triwulanEmployeeDetail, penilai })
        }

        CreateRouteHist(statusRoutes.FINISH, dateStart)
        return response.ok({ message: "Data Berhasil Didapatkan", triwulan, data: { meta: dataArrayObject.meta, data: datas } })
      } else {
        //buat module profile dan triwulan employee detail
        data = await TriwulanEmployee.query()
          .with('AggregatedData', query => {
            query
              .select('te.*')
              .select(Database.raw(`SUM(ted.skor) AS total_skor`))
              .select(Database.raw(`(select sum(skor) from triwulan_employee_details where triwulan_id = '${id}' and direct_supervisor = true and triwulan_employee_id = te.id) as total_skor_direct_supervisor`))
              .select(Database.raw(`(select sum(skor) from triwulan_employee_details where triwulan_id = '${id}' and direct_supervisor = false and triwulan_employee_id = te.id) as total_skor_indirect_supervisor`))
              .select(Database.raw(`(select TO_CHAR(from_date, 'Mon') || ' - ' || TO_CHAR(to_date, 'Mon YY') FROM triwulans where id = '${id}') AS period_of_assessment`))
              .select(Database.raw(`RANK() OVER (ORDER BY SUM(ted.skor) DESC) AS ranking`))
              .select(Database.raw(`(select name from employees e where id = te.employee_id) as employee_name`))
              .from(`triwulan_employees as te`)
              .where('triwulan_id', id)
              .joinRaw(`LEFT JOIN triwulan_employee_details ted ON ted.triwulan_employee_id = te.id`)
              .groupBy('te.id')
          })
          .preload('employee', e => e
            .select('name', 'nik')
            .select(Database.raw(`EXTRACT(YEAR FROM AGE((select to_date from triwulans where id = '${id}'), "date_in")) || ' tahun ' || EXTRACT(MONTH FROM AGE((select to_date from triwulans where id = '${id}'), "date_in")) || ' bulan' AS period_of_work`))
            .preload('divisions', ds => ds.select("title", "divisionId")
              .preload('division', d => d.select('name'))))
          .preload('triwulanEmployeeDetail', ted => ted
            .preload('assessmentComponent', ac => ac.select('name')))
          .select('*')
          .from('AggregatedData')
          .where('employee_id', employeeId)

        const dataArrayObject = JSON.parse(JSON.stringify(data))

        let datas: any = []
        for (let i = 0; i < dataArrayObject.length; i++) {
          const result = await TriwulanHelper(dataArrayObject[i])
          const dataEmployee = { ...result.dataEmployee, triwulan: dataArrayObject.name }
          const triwulanEmployee = result.triwulanEmployee
          const triwulanEmployeeDetail = result.triwulanEmployeeDetail
          const penilai = result.penilai
          datas.push({ dataEmployee, triwulanEmployee, triwulanEmployeeDetail, penilai })
        }
        const { dataEmployee, triwulanEmployee, triwulanEmployeeDetail, penilai } = datas[0]

        CreateRouteHist(statusRoutes.FINISH, dateStart)
        return response.ok({ message: "Data Berhasil Didapatkan", dataEmployee, triwulanEmployee, triwulanEmployeeDetail, penilai })
      }
    } catch (error) {
      const message = "HRDTW03: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengubah data",
        error: message,
        error_data: error,
      });
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Triwulan ID tidak valid" });
    }

    const payload = await request.validate(UpdateTriwulanValidator);
    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }
    if (payload.fromDate! > payload.toDate!) {
      return response.badRequest({ message: "INVALID_DATE_RANGE" })
    }

    try {
      const triwulan = await Triwulan.findOrFail(id);
      const data = await triwulan.merge(payload).save();
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "HRDTW04: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengubah data",
        error: message,
        error_data: error,
      });
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Triwulan ID tidak valid" });
    }

    try {
      const data = await Triwulan.findOrFail(id);
      await data.delete();
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      const message = "HRDTW05: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }

  public async recaps({ params, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { id } = params; // triwulan id
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Triwulan ID tidak valid" });
    }

    try {
      const triwulan = await Triwulan.query()
        .where('id', id)
        .firstOrFail()

      const data = await TriwulanEmployeeDetail.query()
        .select('assessment_component_id')
        .select(Database.raw(`sum(skor) as total_skor`))
        .select(Database.raw(`RANK() OVER (ORDER BY SUM(skor) DESC) AS ranking`))
        .whereHas('triwulanEmployee', te => te.where('triwulan_id', id))
        .preload('assessmentComponent', ac => ac.select('*'))
        .groupBy('assessment_component_id')

      const dataArrayObject = JSON.parse(JSON.stringify(data))

      const groupedCategory = dataArrayObject.reduce((acc, obj) => {
        const category = obj.assessmentComponent.category;

        if (!acc[category]) {
          acc[category] = [];
        }

        const newObj = { ...obj, name: obj.assessmentComponent.name };
        delete newObj.assessmentComponent;

        acc[category].push(newObj);
        return acc;
      }, {});

      response.ok({ message: "Data Berhasil Didapatkan", triwulan, data: groupedCategory })
    } catch (error) {
      const message = "HRDTW06: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }
}
