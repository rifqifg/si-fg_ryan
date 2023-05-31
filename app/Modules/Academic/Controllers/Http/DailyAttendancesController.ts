import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateDailyAttendanceValidator from '../../Validators/CreateDailyAttendanceValidator'
import DailyAttendance from '../../Models/DailyAttendance'
const luxon_1 = require("luxon");
const hariIni = luxon_1.DateTime.now().toSQLDate().toString();

export default class DailyAttendancesController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", mode = "page", classId = "", fromDate = hariIni, toDate = hariIni } = request.qs()

    const formattedStartDate = `${fromDate ? fromDate : hariIni} 00:00:00.000 +0700`;
    const formattedEndDate = `${toDate ? toDate : hariIni} 23:59:59.000 +0700`;

    try {
      let data = {}
      if (mode === "page") {
        data = await DailyAttendance
          .query()
          .where('class_id', classId)
          .whereBetween('date_in', [formattedStartDate, formattedEndDate])
          .paginate(page, limit)
      } else if (mode === "list") {
        data = await DailyAttendance
          .query()
          .whereILike('name', `%${keyword}%`)
          .orderBy('name')
      } else {
        return response.badRequest({ message: "Mode tidak dikenali, (pilih: page / list)" })
      }

      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      const message = "ACSU41: " + error.message || error
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error
      })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateDailyAttendanceValidator)

    try {
      const data = await DailyAttendance.createMany(payload.dailyAttendance)
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      const message = "ACDA-store: " + error.message || error
      console.log(error);
      response.badRequest({
        message: "Gagal menyimpan data",
        error: message,
        error_data: error
      })
    }
  }

  public async show({ }: HttpContextContract) { }

  public async update({ }: HttpContextContract) { }

  public async destroy({ }: HttpContextContract) { }
}
