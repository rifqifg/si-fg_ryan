import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CategoryActivity from 'App/Models/CategoryActivity'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'
import { DateTime } from 'luxon'

export default class CategoryActivitiesController {
  public async index({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
   CreateRouteHist(statusRoutes.START, dateStart)
    const { page = 1, limit = 10, keyword = "" } = request.qs()

    let data = {}

    data = await CategoryActivity.query()
      .whereILike('name', `%${keyword}%`)
      .orderBy('name')
      .paginate(page, limit)

    CreateRouteHist(statusRoutes.FINISH, dateStart)
    response.ok({ message: "Berhasil mengambil data", data })
  }
}
