import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TemplateExcel from 'App/Models/TemplateExcel'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'

export default class TemplateExcelsController {
  public async index({ request, response }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const { page = 1, limit = 10, keyword = "" } = request.qs()

    let data = {}

    data = await TemplateExcel.query()
      .select('id', 'name', 'link', 'description')
      .whereILike('name', `%${keyword}%`)
      .orderBy('name')
      .paginate(page, limit)

    CreateRouteHist(request, statusRoutes.FINISH)
    response.ok({ message: "Berhasil mengambil data", data })
  }
}
