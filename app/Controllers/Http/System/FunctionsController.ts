import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Function from 'App/Models/Function'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { statusRoutes } from 'App/Modules/Log/lib/enum'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { DateTime } from 'luxon'

export default class FunctionsController {
  public async index({ request, response, params }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
   CreateRouteHist(statusRoutes.START, dateStart)
    const { page = 1, limit = 10, keyword = "" } = request.qs()
    const { menu_id } = params

    try {
      const data = await Function
        .query()
        .whereILike('id', `%${keyword}%`)
        .andWhere('menu_id', menu_id)
        .orderBy('id')
        .paginate(page, limit)

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      response.badRequest({ message: "Gagal mengambil data", error })
    }
  }

  public async store({ request, response, params }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
   CreateRouteHist(statusRoutes.START, dateStart)
    const { menu_id } = params
    Function.findOrFail(menu_id).catch(error => response.badRequest({ message: "Gagal mencari data modul", error: error.message }))

    const createFunctionsSchema = schema.create({
      id: schema.string({}, [
        rules.unique({ table: 'functions', column: 'id' }),
        rules.alphaNum({ allow: ['underscore', 'dash'] })
      ]),
      description: schema.string.optional()
    })

    const payload = await request.validate({ schema: createFunctionsSchema })
    Object.assign(payload, { menu_id })
    try {
      const data = await Function.create(payload)
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      response.badRequest({ message: "Gagal menyimpan data", error })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
   CreateRouteHist(statusRoutes.START, dateStart)
    const { id } = params
    try {
      const data = await Function.query().where('id', id)
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      console.log(error);
      response.badRequest({ message: "Gagal mengambil data", error })
    }
  }

  // create ini untuk nanti get all pas mau bikin permissions
  public async create({ response, params }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
   CreateRouteHist(statusRoutes.START, dateStart)
    const data = await Function.query().select('id', 'description').where('menu_id', params.menu_id)
    CreateRouteHist(statusRoutes.FINISH, dateStart)
    response.ok({ message: "Berhasil mengambil data", data })
  }


  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params
    const updateFunctionSchema = schema.create({
      id: schema.string.optional({}, [
        rules.unique({ table: 'functions', column: 'id' }),
        rules.alphaNum({ allow: ['underscore', 'dash'] })
      ]),
      description: schema.string.optional()
    })

    const payload = await request.validate({ schema: updateFunctionSchema })
    if (JSON.stringify(payload) === '{}') {
      console.log("data update function kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" })
    }

    try {
      await Function.findOrFail(id)
      await Function.query().where('id', id).update(payload)

      response.ok({ message: "Berhasil mengubah data" })
    } catch (error) {
      console.log(error);
      response.badRequest({ message: "Gagal mengubah data", error: error.message })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params
    try {
      const module = await Function.findOrFail(id)
      await module.delete()

      response.ok({ message: "Berhasil mengahpus data" })
    } catch (error) {
      response.badRequest({ message: "Gagal menghapus data", error: error.message })
    }
  }
}
