import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AcademicYear from 'App/Modules/Academic/Models/AcademicYear'

export default class AcademicYearsController {
    public async index({ request, response }: HttpContextContract) {
        const { page = 1, limit = 10, keyword = "", isActive } = request.qs()
        
        const active = isActive === "true" ? true : false
        try {
            const data = await AcademicYear.query()
                .whereILike('year', `%${keyword}%`)
                .orderBy('year')
                .if(isActive, q => q.where('active', active))
                .paginate(page, limit)

            response.ok({ message: "Berhasil mengambil data semua tahun akademik", data })
        } catch (error) {
            response.badRequest({ message: "PP_AYE01: Gagal mengambil data semua tahun akademik", error })
        }
    }
}
