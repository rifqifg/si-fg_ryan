import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CategoryActivity from 'App/Models/CategoryActivity'

export default class CategoryActivitiesController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "" } = request.qs()

    let data = {}

    data = await CategoryActivity.query()
      .whereILike('name', `%${keyword}%`)
      .orderBy('name')
      .paginate(page, limit)

    response.ok({ message: "Berhasil mengambil data", data })
  }
}
