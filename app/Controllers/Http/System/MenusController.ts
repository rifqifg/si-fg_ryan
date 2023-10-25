import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Menu from 'App/Models/Menu'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { statusRoutes } from 'App/Modules/Log/lib/enum'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'

export default class MenusController {
  public async index({ request, response, params }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const { page = 1, limit = 10, keyword = "" } = request.qs()
    const { module_id } = params
    try {
      const data = await Menu
        .query()
        .where('module_id', module_id)
        .andWhereILike('id', `%${keyword}%`)
        .orderBy('id')
        .paginate(page, limit)

        CreateRouteHist(request, statusRoutes.FINISH)
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      CreateRouteHist(request, statusRoutes.ERROR, error.message || error)
      console.log(error);
      response.badRequest({ message: "Gagal mengambil data", error: error.message })
    }
  }

  public async store({ request, response, params }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const { module_id } = params
    Menu.findOrFail(module_id).catch(error => response.badRequest({ message: "Gagal mencari data modul", error: error.message }))

    const createMenuSchema = schema.create({
      id: schema.string({}, [
        rules.unique({ table: 'menus', column: 'id' }),
        rules.alphaNum({ allow: ['underscore', 'dash'] })
      ]),
      description: schema.string.optional()
    })

    const payload = await request.validate({ schema: createMenuSchema })
    Object.assign(payload, { module_id })
    try {
      const data = await Menu.create(payload)
      CreateRouteHist(request, statusRoutes.FINISH)
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      CreateRouteHist(request, statusRoutes.ERROR, error.message || error)
      response.badRequest({ message: "Gagal menyimpan data", error: error.message })
    }
  }

  public async show({ request, params, response }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const { id } = params
    try {
      const data = await Menu.query().preload('functions').where('id', id)
      CreateRouteHist(request, statusRoutes.FINISH)
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      CreateRouteHist(request, statusRoutes.ERROR, error.message || error)
      console.log(error);
      response.badRequest({ message: "Gagal mengambil data", error })
    }
  }

  // create ini untuk nanti get all pas mau bikin permissions
  public async create({ request, params, response }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const data = await Menu.query().select('id', 'description').where('module_id', params.module_id)
    CreateRouteHist(request, statusRoutes.FINISH)
    response.ok({ message: "Berhasil mengambil data", data })
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params
    const updateMenuSchema = schema.create({
      id: schema.string.optional({}, [
        rules.unique({ table: 'menus', column: 'id' }),
        rules.alphaNum({ allow: ['underscore', 'dash'] })
      ]),
      description: schema.string.optional()
    })

    const payload = await request.validate({ schema: updateMenuSchema })

    if (JSON.stringify(payload) === '{}') {
      console.log("data update menu kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" })
    }
    try {
      await Menu.findOrFail(id)
      await Menu.query().where('id', id).update(payload)

      response.ok({ message: "Berhasil mengubah data" })
    } catch (error) {
      console.log(error);
      response.badRequest({ message: "Gagal mengubah data", error: error.message })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params
    try {
      const module = await Menu.findOrFail(id)
      await module.delete()

      response.ok({ message: "Berhasil mengahpus data" })
    } catch (error) {
      response.badRequest({ message: "Gagal menghapus data", error: error.message })
    }
  }
}
