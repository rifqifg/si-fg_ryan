import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import EntranceExamSchedule from '../../Models/EntranceExamSchedule'
import PPDBBatch from '../../Models/PPDBBatch'

export default class EntranceExamSchedulesController {
    public async index({ request, response }: HttpContextContract) {
        const { page = 1, limit = 10, active } = request.qs()

        console.log(typeof active)
        try {
            let data: object
            if (active === "true" || active === "false") {
                data = await PPDBBatch.query()
                    .where('active', active)
                    .preload('entranceExamSchedule')
            } else {
                data = await EntranceExamSchedule.query()
                    // .whereILike('', `%${batch_name}%`)
                    // .orderBy('year')
                    .paginate(page, limit)
            }

            response.ok({ message: "Berhasil mengambil data jadwal ujian pendaftaran", data })
        } catch (error) {
            response.badRequest({ message: "Gagal mengambil data jadwal ujian pendaftaran", error })
        }
    }
}
