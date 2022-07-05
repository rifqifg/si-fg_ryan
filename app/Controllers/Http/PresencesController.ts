import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Presence from 'App/Models/Presence'
import CreatePresenceValidator from 'App/Validators/CreatePresenceValidator'
import UpdatePresenceValidator from 'App/Validators/UpdatePresenceValidator'

export default class PresencesController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", orderBy = "", orderDirection = 'ASC' } = request.qs()
    //TODO: bikin raw query & select secukupnya biar bisa order by join column
    const data = await Presence.query()
      .preload('activity')
      .whereHas('activity', query => {
        query.whereILike('name', `%${keyword}%`)
      })
      .preload('employee', query => {
        query.select('name', 'id', 'nip')
      })
      .orWhereHas('employee', query => {
        query.whereILike('name', `%${keyword}%`)
      })
      .paginate(page, limit)

    response.ok({ message: "Data Berhasil Didapatkan", data })
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreatePresenceValidator)

    try {
      const data = await Presence.create(payload)
      response.created({ message: "Create data success", data })
    } catch (error) {
      console.log(error);
      response.badRequest({ ...error })
    }
  }

  // public async create({ }: HttpContextContract) { }

  public async show({ }: HttpContextContract) { }

  public async edit({ }: HttpContextContract) { }

  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params
    const payload = await request.validate(UpdatePresenceValidator)
    try {
      const findData = await Presence.findOrFail(id)
      const data = await findData.merge(payload).save()
      response.ok({ message: "Update data success", data })
    } catch (error) {
      console.log(error);
      response.badGateway({ ...error })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params
    try {
      const data = await Presence.findOrFail(id)
      await data.delete()

      response.ok({ message: "Delete data success" })
    } catch (error) {
      console.log(error);
      response.internalServerError(error)
    }
  }
}
