import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateLessonAttendanceValidator from '../../Validators/CreateLessonAttendanceValidator'
import LessonAttendance from '../../Models/LessonAttendance'
const luxon_1 = require("luxon");
const hariIni = luxon_1.DateTime.now().toSQLDate().toString();
import { validate as uuidValidation } from "uuid";
import UpdateLessonAttendanceValidator from '../../Validators/UpdateLessonAttendanceValidator';

export default class LessonAttendancesController {
    public async index({ request, response }: HttpContextContract) {
        const { page = 1, limit = 10, keyword = "", fromDate = hariIni, toDate = hariIni, recap = false, className = "", subject = "", session = "" } = request.qs()
        const formattedStartDate = `${fromDate ? fromDate : hariIni} 00:00:00.000 +0700`;
        const formattedEndDate = `${toDate ? toDate : hariIni} 23:59:59.000 +0700`;

        try {
            let data = {}

            console.log(recap);

            data = await LessonAttendance
                .query()
                .select('*')
                .whereBetween('date', [formattedStartDate, formattedEndDate])
                .whereHas('student', s => s.whereILike('name', `%${keyword}%`))
                .whereHas('class', s => s.whereILike('name', `%${className}%`))
                .whereHas('subject', s => s.whereILike('name', `%${subject}%`))
                .whereHas('session', s => s.whereILike('session', `%${session}%`))
                .preload('student', s => s.select('name'))
                .preload('class', c => c.select('name'))
                .preload('session', s => s.select('session'))
                .preload('subject', s => s.select('name'))
                .orderBy('date', 'desc')
                .paginate(page, limit)

            response.ok({ message: "Berhasil mengambil data", data })
        } catch (error) {
            const message = "ACLA-index: " + error.message || error
            console.log(error);
            response.badRequest({
                message: "Gagal mengambil data",
                error: message,
                error_data: error
            })
        }
    }

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

    public async show({ params, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "DailyAttendance ID tidak valid" }) }

        try {
            const data = await LessonAttendance
                .query()
                .preload('student', s => s.select('name'))
                .preload('class', c => c.select('name'))
                .preload('session', s => s.select('session'))
                .preload('subject', s => s.select('name'))
                .where('id', id).firstOrFail()
            response.ok({ message: "Berhasil mengambil data", data })
        } catch (error) {
            const message = "ACLA-SHOW: " + error.message || error
            console.log(error);
            response.badRequest({
                message: "Gagal mengambil data",
                error: message,
                error_data: error
            })
        }
    }

    public async update({ params, request, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "LessonAttendance ID tidak valid" }) }

        const payload = await request.validate(UpdateLessonAttendanceValidator)
        if (JSON.stringify(payload) === '{}') {
            console.log("data update kosong");
            return response.badRequest({ message: "Data tidak boleh kosong" })
        }
        try {
            const daily = await LessonAttendance.findOrFail(id)
            const data = await daily.merge(payload).save()
            response.ok({ message: "Berhasil mengubah data", data })
        } catch (error) {
            const message = "ACLA-UPDATE: " + error.message || error
            console.log(error);
            response.badRequest({
                message: "Gagal mengubah data",
                error: message,
                error_data: error
            })
        }
    }

    public async destroy({ params, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "LessonAttendance ID tidak valid" }) }

        try {
            const data = await LessonAttendance.findOrFail(id)
            await data.delete()
            response.ok({ message: "Berhasil menghapus data" })
        } catch (error) {
            const message = "ACLA-DESTROY: " + error.message || error
            console.log(error);
            response.badRequest({
                message: "Gagal menghapus data",
                error: message,
                error_data: error
            })
        }
    }
}
