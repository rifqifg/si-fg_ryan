import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Employee from 'App/Models/Employee'
import User from 'App/Models/User'

export default class DashboardHrdsController {
  public async statusEmployee({ auth, response }: HttpContextContract) {
    try {
      const data = await Employee.query()
        .select('id', 'name', 'default_presence')
        .select(Database.raw(`EXTRACT(YEAR FROM AGE(CURRENT_DATE, "date_in")) || ' tahun ' || EXTRACT(MONTH FROM AGE(CURRENT_DATE, "date_in")) || ' bulan' AS period_of_work`))
        .where('id', auth.user!.$attributes.employeeId)
        .preload('employeeUnits', eu => eu
          .select('id', 'unit_id', 'title', 'status')
          .preload('unit', u => u.select('name')))
        .first()

      return response.ok({ message: "get data successfully", data })
    } catch (error) {
      const message = "HRDDASH01: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async totalEmployee({ auth, response }: HttpContextContract) {
    try {
      const user = await User.query()
        .preload('employee', e => e
          .select('id', 'name', 'foundation_id'))
        .preload('roles', r => r
          .preload('role'))
        .where('employee_id', auth.user!.$attributes.employeeId)
        .first()

      const part_time = await Employee.query()
        .count('id', 'part_time')
        .where('foundation_id', user!.employee.foundationId)
        .andWhere('status', 'PART_TIME')
        .andWhereNull('date_out')
        .first()

      const full_time = await Employee.query()
        .count('id', 'full_time')
        .where('foundation_id', user!.employee.foundationId)
        .andWhere('status', 'FULL_TIME')
        .andWhereNull('date_out')
        .first()

      response.ok({ message: 'get data successfully', data: { full_time: full_time?.$extras.full_time, part_time: part_time?.$extras.part_time } })
    } catch (error) {
      const message = "HRDDASH01: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }
}
