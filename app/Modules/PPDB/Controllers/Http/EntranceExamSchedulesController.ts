import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import EntranceExamSchedule from '../../Models/EntranceExamSchedule'
import PPDBBatch from '../../Models/PPDBBatch'

export default class EntranceExamSchedulesController {
    public async index({ request, response }: HttpContextContract) {
        const { page = 1, limit = 10, batch_name = "" } = request.qs()

        try {
            let data
            if (batch_name === "") {
                data = await EntranceExamSchedule.query()
                    // .whereILike('', `%${batch_name}%`)
                    // .orderBy('year')
                    .paginate(page, limit)
            } else {
                data = await PPDBBatch.query()
                    .whereILike('name', `%${batch_name}%`)
                    .orderBy('name')
                    .paginate(page, limit)
            }

            response.ok({ message: "Berhasil mengambil data jadwal ujian pendaftaran", data })
        } catch (error) {
            response.badRequest({ message: "Gagal mengambil data jadwal ujian pendaftaran", error })
        }
    }
}
