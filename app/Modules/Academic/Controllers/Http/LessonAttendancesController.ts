import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateLessonAttendanceValidator from '../../Validators/CreateLessonAttendanceValidator'
import LessonAttendance from '../../Models/LessonAttendance'
const luxon_1 = require("luxon");
const hariIni = luxon_1.DateTime.now().toSQLDate().toString();
import { validate as uuidValidation } from "uuid";
import UpdateLessonAttendanceValidator from '../../Validators/UpdateLessonAttendanceValidator';
import Database from '@ioc:Adonis/Lucid/Database';

export default class LessonAttendancesController {
    public async index({ request, response }: HttpContextContract) {
        const { page = 1, limit = 10, keyword = "", fromDate = hariIni, toDate = hariIni, recap = false, className = "", subject = "", session = "" } = request.qs()
        const formattedStartDate = `${fromDate ? fromDate : hariIni} 00:00:00.000 +0700`;
        const formattedEndDate = `${toDate ? toDate : hariIni} 23:59:59.000 +0700`;

        let data = {}

        if (recap) {
            data = await LessonAttendance
                .query()
                .select('class_id', 'subject_id')
                .select(
                    Database.raw(`sum(case when status = 'present' then 1 else 0 end) as present`),
                    Database.raw(`sum(case when status = 'permission' then 1 else 0 end) as permission`),
                    Database.raw(`sum(case when status = 'sick' then 1 else 0 end) as sick`),
                    Database.raw(`sum(case when status = 'absent' then 1 else 0 end) as absent`),
                    //TODO: menghitung persen status
                    Database.raw(`round(cast(sum(case when status = 'present' then 1 else 0 end) * 100.0 / (count(status))as decimal(10,2)),0) as present_precentage`),
                    Database.raw(`round(cast(sum(case when status = 'permission' then 1 else 0 end) * 100.0 / (count(status))as decimal(10,2)),0) as permission_precentage`),
                    Database.raw(`round(cast(sum(case when status = 'sick' then 1 else 0 end) * 100.0 / (count(status))as decimal(10,2)),0) as sick_precentage`),
                    Database.raw(`round(cast(sum(case when status = 'absent' then 1 else 0 end) * 100.0 / (count(status))as decimal(10,2)),0) as absent_precentage`),
                )
                .whereBetween('date', [formattedStartDate, formattedEndDate])
                .preload('class', c => c.select('name').withCount('students'))
                .preload('subject', s => s.select('name'))
                .groupBy('class_id', 'subject_id')
                .paginate(page, limit)

            return response.ok({ message: "Berhasil mengambil data", data })
        }

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
    }

    public async store({ request, response }: HttpContextContract) {
        const payload = await request.validate(CreateLessonAttendanceValidator)

        const data = await LessonAttendance.createMany(payload.lessonAttendance)
        response.created({ message: "Berhasil menyimpan data", data })
    }

    public async show({ params, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "DailyAttendance ID tidak valid" }) }

        const data = await LessonAttendance
            .query()
            .preload('student', s => s.select('name'))
            .preload('class', c => c.select('name'))
            .preload('session', s => s.select('session'))
            .preload('subject', s => s.select('name'))
            .where('id', id).firstOrFail()
        response.ok({ message: "Berhasil mengambil data", data })
    }

    public async update({ params, request, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "LessonAttendance ID tidak valid" }) }

        const payload = await request.validate(UpdateLessonAttendanceValidator)
        if (JSON.stringify(payload) === '{}') {
            console.log("data update kosong");
            return response.badRequest({ message: "Data tidak boleh kosong" })
        }

        const daily = await LessonAttendance.findOrFail(id)
        const data = await daily.merge(payload).save()

        response.ok({ message: "Berhasil mengubah data", data })
    }

    public async destroy({ params, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "LessonAttendance ID tidak valid" }) }

        const data = await LessonAttendance.findOrFail(id)
        await data.delete()

        response.ok({ message: "Berhasil menghapus data" })
    }
}
