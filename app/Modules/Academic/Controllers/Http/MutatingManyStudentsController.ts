import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { validate as uuidValidation } from "uuid";
import Class from '../../Models/Class';
import Student from '../../Models/Student';
import { statusRoutes } from 'App/Modules/Log/lib/enum';
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist';
import { DateTime } from 'luxon';

export default class StudentBatchMutationsController {
    public async update({ params, request, response }: HttpContextContract) {
        const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
        const class_id = params.id

        if (!uuidValidation(class_id)) {
            return response.badRequest({ message: "Student ID tidak valid" });
        }

        try {
            //ngecek is_graduated di tabel Classes
            const classIsGraduated = await Class.find(class_id)

            const rawBody = request.raw();
            const payload = JSON.parse(rawBody!);

            payload.map(async value => {
                if (!uuidValidation(value.student_id)) {
                    return response.badRequest({ message: "Student ID tidak valid" });
                }
                const siswa = await Student.findOrFail(value.student_id)
                await siswa?.merge({ isGraduated: classIsGraduated?.isGraduated, classId: class_id }).save()
            })

            CreateRouteHist(statusRoutes.FINISH, dateStart)
            response.ok({ message: "Berhasil pindah Siswa" })
        } catch (error) {
            console.log(error);
            CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
            response.badRequest({
                message: "Gagal pindah siswa",
                error: error.message,
            });
        }
    }
}
