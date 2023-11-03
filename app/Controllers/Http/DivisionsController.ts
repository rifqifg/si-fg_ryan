import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Division from 'App/Models/Division'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'
import { DateTime } from 'luxon'


export default class DivisionsController {
  public async index({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
   CreateRouteHist(statusRoutes.START, dateStart)
    const { page = 1, limit = 10, keyword = "", orderBy = "name", orderDirection = 'ASC' } = request.qs()
    const data = await Division.query()
      .preload('employees', e => {
        e.select('title', 'employee_id')
        e.preload('employee', m => m.select('name'))
        e.where('title', '=', 'lead')
      })
      .whereILike('name', `%${keyword}%`)
      .orderBy(orderBy, orderDirection)
      .paginate(page, limit)

    CreateRouteHist(statusRoutes.FINISH, dateStart)
    response.ok({ message: "Data Berhasil Didapatkan", data })
  }

  public async getDivision({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
   CreateRouteHist(statusRoutes.START, dateStart)
    const { keyword = "" } = request.qs()
    try {
      const data = await Division.query()
        .whereILike('name', `%${keyword}%`)
        .orderBy('name')

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Get Data Success", data })
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      console.log(error);
      response.badRequest(error)
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
   CreateRouteHist(statusRoutes.START, dateStart)
    const createNewDivisionSchema = schema.create({
      name: schema.string({ trim: true }, [
        rules.minLength(2)
      ]),
      description: schema.string.optional({}, [rules.minLength(6)]),
    })

    const payload = await request.validate({ schema: createNewDivisionSchema })

    try {
      const data = await Division.create(payload)
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Create data success", data })
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      console.log(error);
      return response.internalServerError(error)
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
   CreateRouteHist(statusRoutes.START, dateStart)
    const { id } = params

    try {
      const data = await Division.query()
        .preload('employees', e => {
          e.select('title', 'employee_id')
          e.preload('employee', m => m.select('name'))
        })
        .where('id', id)
        .firstOrFail()

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Get data success", data })
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      console.log(error);
      return response.internalServerError(error)
    }
  }

  public async edit({ }: HttpContextContract) { }

  public async update({ request, response, params }: HttpContextContract) {

    const { id } = params
    const createNewDivisionSchema = schema.create({
      name: schema.string({ trim: true }, [
        rules.minLength(2)
      ]),
      description: schema.string.optional({}, [rules.minLength(6)]),
    })

    const payload = await request.validate({ schema: createNewDivisionSchema })

    try {

      const data = await Division.findOrFail(id)
      await data.merge(payload).save()

      response.ok({ message: "Update data success", data })
    } catch (error) {
      console.log(error);

      return response.internalServerError({ ...error })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params
    try {
      const data = await Division.findOrFail(id)
      await data.delete()

      response.ok({ message: "Delete data success" })
    } catch (error) {
      console.log(error);
      response.internalServerError(error)
    }
  }
}
