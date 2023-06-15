import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import EntranceExamSchedule from '../../Models/EntranceExamSchedule'

export default class EntranceExamSchedulesController {
    public async index({ request, response }: HttpContextContract) {
        const { page = 1, limit = 10, active } = request.qs()

        console.log(typeof active)
        try {
            let data: object
            if (active) {
                data = await EntranceExamSchedule
                    .query()
                    .whereHas('batches', batch => {
                        batch.where('active', active)
                    })
                    .preload('batches', b => b.preload('academicYears'))
                    .paginate(page, limit)
            } else {
                data = await EntranceExamSchedule
                    .query()
                    .preload('batches', b => b.preload('academicYears'))
                    .paginate(page, limit)
            }

            response.ok({ message: "Berhasil mengambil data jadwal ujian pendaftaran", data })
        } catch (error) {
            response.badRequest({ message: "Gagal mengambil data jadwal ujian pendaftaran", error: error.message })
        }
    }
}
