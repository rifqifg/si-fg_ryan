import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import EmployeeType from 'App/Models/EmployeeType'

export default class EmployeeTypesController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "" } = request.qs()
    const data = await EmployeeType.query()
      .whereILike('name', `%${keyword}%`)
      .paginate(page, limit)

    response.ok({
      message: "Berhasil mengambil data",
      data
    })
  }

  //TODO: bikin crud
  public async store({ }: HttpContextContract) { }

  public async show({ }: HttpContextContract) { }

  public async update({ }: HttpContextContract) { }

  public async destroy({ }: HttpContextContract) { }
}
