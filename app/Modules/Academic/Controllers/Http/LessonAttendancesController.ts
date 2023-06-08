import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateLessonAttendanceValidator from '../../Validators/CreateLessonAttendanceValidator'
import LessonAttendance from '../../Models/LessonAttendance'

export default class LessonAttendancesController {
    public async store({ request, response }: HttpContextContract) {
        const payload = await request.validate(CreateLessonAttendanceValidator)

        try {
            const data = await LessonAttendance.createMany(payload.lessonAttendance)
            response.created({ message: "Berhasil menyimpan data", data })
        } catch (error) {
            const message = "ACLA-store: " + error.message || error
            console.log(error);
            response.badRequest({
                message: "Gagal menyimpan data",
                error: message,
                error_data: error
            })
        }
    }
}
