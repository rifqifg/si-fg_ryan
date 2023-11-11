import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { TriwulanHelper } from 'App/Helpers/TriwulanHelper'
import Triwulan from 'App/Models/Triwulan'
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

    try {
      let data
      if (fromDate && toDate) {
        data = await Triwulan.query()
          .whereILike('name', `%${keyword}%`)
          .andWhere(query => {
            query.whereBetween('from_date', [fromDate, toDate])
            query.orWhereBetween('to_date', [fromDate, toDate])
          })
          .paginate(page, limit)
      } else {
        data = await Triwulan.query()
          .whereILike('name', `%${keyword}%`)
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

  //TODO: show
  public async show({ request, response, params }: HttpContextContract) {
    const { keyword = "" } = request.qs()

    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Triwulan ID tidak valid" });
    }

    try {
      const data = await Triwulan.query()
        .where('id', id)
        .preload('triwulanEmployee', te => te
          .with('AggregatedData', query => {
            query
              .select('te.*')
              .select(Database.raw(`SUM(ted.skor) AS total_skor`))
              .select(Database.raw(`RANK() OVER (ORDER BY SUM(ted.skor) DESC) AS ranking`))
              .select(Database.raw(`(select name from employees e where id = te.employee_id) as employee_name`))
              .from(`triwulan_employees as te`)
              .joinRaw(`LEFT JOIN triwulan_employee_details ted ON ted.triwulan_employee_id = te.id`)
              .groupBy('te.id')
          })
          .preload('employee', e => e.select('name')
            .preload('divisions', ds => ds.select("title", "divisionId")
              .preload('division', d => d.select('name'))))
          .preload('triwulanEmployeeDetail', ted => ted
            .preload('assessmentComponent', ac => ac.select('name')))
          .select('*')
          .from('AggregatedData')
          .whereILike('employee_name', `%${keyword}%`)
          .orderBy('employee_name'))
        .firstOrFail()

      const dataArrayObject = JSON.parse(JSON.stringify(data))
      const triwulan = {
        id: dataArrayObject.id,
        name: dataArrayObject.name,
        from_date: dataArrayObject.from_date,
        to_date: dataArrayObject.to_date,
        description: dataArrayObject.description,
      }

      let datas: any = []
      for (let i = 0; i < dataArrayObject.triwulanEmployee.length; i++) {
        const result = await TriwulanHelper(dataArrayObject.triwulanEmployee[i])
        const triwulanEmployee = result.triwulanEmployee
        const triwulanEmployeeDetail = result.triwulanEmployeeDetail
        datas.push({ triwulanEmployee, triwulanEmployeeDetail })
      }

      response.ok({ message: "Data Berhasil Didapatkan", triwulan, data })
    } catch (error) {
      const message = "HRDTW03: " + error.message || error;
      // CreateRouteHist(statusRoutes.ERROR, dateStart, message)
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
}
