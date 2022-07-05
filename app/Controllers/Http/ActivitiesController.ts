import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Activity from 'App/Models/Activity';
import CreateActivityValidator from 'App/Validators/CreateActivityValidator'
import UpdateActivityValidator from 'App/Validators/UpdateActivityValidator';

export default class ActivitiesController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", orderBy = "name", orderDirection = 'ASC' } = request.qs()
    const data = await Activity.query()
      .whereILike('name', `%${keyword}%`)
      .orderBy(orderBy, orderDirection)
      .paginate(page, limit)

    response.ok({ message: "Data Berhasil Didapatkan", data })
  }

  public async getActivity({ request, response }: HttpContextContract) {
    const { keyword = "", orderBy = "name", orderDirection = 'ASC' } = request.qs()

    const data = await Activity.query()
      .whereILike('name', `%${keyword}%`)
      .orderBy(orderBy, orderDirection)
    response.ok({ message: "Data Berhasil Didapatkan", data })
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateActivityValidator)

    try {
      const formattedPayload = {
        name: payload.name,
        description: payload.description,
        timeInStart: payload.timeInStart.toFormat('HH:mm'),
        timeInEnd: payload.timeInEnd.toFormat('HH:mm'),
        timeOutStart: payload.timeOutStart.toFormat('HH:mm'),
        timeOutEnd: payload.timeOutEnd.toFormat('HH:mm'),
      }
      const data = await Activity.create(formattedPayload)

      response.created({
        message: "Create data success", data
      })
    } catch (error) {
      console.log(error);
      response.badRequest(error)
    }
  }

  // public async create({ }: HttpContextContract) { }

  // public async show({ }: HttpContextContract) { }

  // public async edit({ }: HttpContextContract) { }

  public async update({ request, response, params }: HttpContextContract) {
    const { id } = params
    const payload = await request.validate(UpdateActivityValidator)

    try {
      let formattedPayload = {}

      payload.name ? formattedPayload['name'] = payload.name : ''
      payload.description ? formattedPayload['description'] = payload.description : ''
      payload.timeInStart ? formattedPayload['timeInStart'] = payload.timeInStart!.toFormat('HH:mm') : ''
      payload.timeInEnd ? formattedPayload['timeInEnd'] = payload.timeInEnd!.toFormat('HH:mm') : ''
      payload.timeOutStart ? formattedPayload['timeOutStart'] = payload.timeOutStart!.toFormat('HH:mm') : ''
      payload.timeOutEnd ? formattedPayload['timeOutEnd'] = payload.timeOutEnd!.toFormat('HH:mm') : ''

      const findData = await Activity.findOrFail(id)
      const data = await findData.merge(formattedPayload).save()

      response.created({
        message: "Create data success", data
      })
    } catch (error) {
      console.log(error);
      response.badRequest(error)
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params
    try {
      const data = await Activity.findOrFail(id)
      await data.delete()

      response.ok({ message: "Delete data success" })
    } catch (error) {
      console.log(error);
      response.internalServerError(error)
    }
  }
}
