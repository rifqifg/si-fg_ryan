import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateTeacherAttendanceValidator from '../../Validators/CreateTeacherAttendanceValidator'
import TeacherAttendance from '../../Models/TeacherAttendance'

export default class TeacherAttendancesController {
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
