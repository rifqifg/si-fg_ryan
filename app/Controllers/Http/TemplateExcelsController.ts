import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TemplateExcel from 'App/Models/TemplateExcel'

export default class TemplateExcelsController {
    public async index({ request, response }: HttpContextContract) {
        const { page = 1, limit = 10, keyword = "" } = request.qs()

        let data = {}

        data = await TemplateExcel.query()
            .select('id', 'name', 'link', 'description')
            .whereILike('name', `%${keyword}%`)
            .orderBy('name')
            .paginate(page, limit)

        response.ok({ message: "Berhasil mengambil data", data })
    }
}
