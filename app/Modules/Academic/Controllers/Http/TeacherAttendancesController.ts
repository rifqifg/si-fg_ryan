import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateTeacherAttendanceValidator from '../../Validators/CreateTeacherAttendanceValidator'
import TeacherAttendance from '../../Models/TeacherAttendance'
const luxon_1 = require("luxon")
const hariIni = luxon_1.DateTime.now().toSQLDate().toString()

export default class TeacherAttendancesController {

    public async index({ request, response }: HttpContextContract) {
        const { page = 1, limit = 10, keyword = "", fromDate = hariIni, toDate = hariIni, recap = false, className = "", subject = "", session = "" } = request.qs()
        const formattedStartDate = `${fromDate ? fromDate : hariIni} 00:00:00.000 +0700`;
        const formattedEndDate = `${toDate ? toDate : hariIni} 23:59:59.000 +0700`;

        try {
            let data = {}

            console.log(recap);

            data = await TeacherAttendance
                .query()
                .select('*')
                .whereBetween('date_in', [formattedStartDate, formattedEndDate])
                .whereHas('teacher', s => s.preload('employee', e => e.whereILike('name', `%${keyword}%`)))
                .whereHas('class', s => s.whereILike('name', `%${className}%`))
                .whereHas('subject', s => s.whereILike('name', `%${subject}%`))
                .whereHas('session', s => s.whereILike('session', `%${session}%`))
                .preload('teacher', s => s.preload('employee', e => e.select('name')))
                .preload('class', c => c.select('name'))
                .preload('session', s => s.select('session'))
                .preload('subject', s => s.select('name'))
                .orderBy('date_in', 'desc')
                .paginate(page, limit)

            response.ok({ message: "Berhasil mengambil data", data })
        } catch (error) {
            const message = "ACTA-index: " + error.message || error
            console.log(error);
            response.badRequest({
                message: "Gagal mengambil data",
                error: message,
                error_data: error
            })
        }
    }
    public async store({ request, response }: HttpContextContract) {
        const payload = await request.validate(CreateTeacherAttendanceValidator)
        try {
            const data = await TeacherAttendance.create(payload)
            response.created({ message: "Berhasil menyimpan data", data })
        } catch (error) {
            const message = "ACTA57: " + error.message || error
            console.log(error);
            response.badRequest({
                message: "Gagal menyimpan data",
                error: message,
                error_data: error
            })
        }
    }
}
