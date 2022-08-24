import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Role from 'App/Models/Role'
import CreateRoleValidator from 'App/Validators/CreateRoleValidator'

export default class RolesController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "" } = request.qs()

    try {
      const data = await Role
        .query()
        .whereILike('name', `%${keyword}%`)
        .orderBy('name')
        .paginate(page, limit)
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      response.badRequest({ message: "Gagal mengambil data", error })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateRoleValidator)
    // TODO: validate payload.permissions
    response.ok(payload)
  }

  public async show({ }: HttpContextContract) { }

  public async edit({ }: HttpContextContract) { }

  public async update({ }: HttpContextContract) { }

  public async destroy({ }: HttpContextContract) { }
}
