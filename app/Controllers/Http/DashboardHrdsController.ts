import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Employee from 'App/Models/Employee'

export default class DashboardHrdsController {
  public async kepegawaian({ auth, response }: HttpContextContract) {
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
}
