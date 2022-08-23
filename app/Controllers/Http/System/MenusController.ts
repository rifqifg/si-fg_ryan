import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Menu from 'App/Models/Menu'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class MenusController {
  public async index({ request, response, params }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "" } = request.qs()
    const { module_id } = params
    try {
      const data = await Menu
        .query()
        .where('module_id', module_id)
        .andWhereILike('id', `%${keyword}%`)
        .orderBy('id')
        .paginate(page, limit)
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      console.log(error);

      response.badRequest({ message: "Gagal mengambil data", error: error.message })
    }
  }

  public async store({ request, response, params }: HttpContextContract) {
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
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      response.badRequest({ message: "Gagal menyimpan data", error: error.message })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params
    try {
      const data = await Menu.query().preload('functions').where('id', id)
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      console.log(error);

      response.badRequest({ message: "Gagal mengambil data", error })
    }
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
