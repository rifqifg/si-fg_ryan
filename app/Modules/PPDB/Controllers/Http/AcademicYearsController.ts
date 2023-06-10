import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AcademicYear from 'App/Modules/Academic/Models/AcademicYear'

export default class AcademicYearsController {
    public async index({ request, response }: HttpContextContract) {
        const { page = 1, limit = 10, keyword = "" } = request.qs()

        try {
            const data = await AcademicYear.query()
                .whereILike('year', `%${keyword}%`)
                .orderBy('year')
                .paginate(page, limit)

            response.ok({ message: "Berhasil mengambil data semua tahun akademik", data })
        } catch (error) {
            response.badRequest({ message: "Gagal mengambil data semua tahun akademik", error })
        }
    }
}
