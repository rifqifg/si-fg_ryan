import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import TriwulanEmployee from 'App/Models/TriwulanEmployee'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'
import { DateTime } from 'luxon'

export default class TriwulanEmployeesController {
  public async index({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { keyword = "" } = request.qs()

    try {

      const data = await TriwulanEmployee.query()
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
        .preload('employee', e => e.select('name'))
        .preload('triwulanEmployeeDetail')
        .select('*')
        .from('AggregatedData')
        .whereILike('employee_name', `%${keyword}%`)
        .orderBy('employee_name')

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
}
