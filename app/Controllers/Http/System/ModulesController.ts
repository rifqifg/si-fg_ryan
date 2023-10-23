import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Module from 'App/Models/Module'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'

export default class ModulesController {
  public async index({ request, response }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const { page = 1, limit = 10, keyword = "", mode = "pagination" } = request.qs()

    try {
      if (mode === "pagination") {
        const data = await Module
          .query()
          .whereILike('id', `%${keyword}%`)
          .orderBy('id')
          .paginate(page, limit)

        CreateRouteHist(request, statusRoutes.FINISH)
        response.ok({ message: "Berhasil mengambil data", data })
      } else if (mode === "tree") {
        const data = await Module.query().preload('menus', menus => menus.preload('functions'))
        CreateRouteHist(request, statusRoutes.FINISH)
        response.ok({ message: "Berhasil mengambil data", data })
      }
    } catch (error) {
      CreateRouteHist(request, statusRoutes.ERROR, error.message || error)
      response.badRequest({ message: "Gagal mengambil data", error })
    }
  }

  // create ini untuk nanti get all pas mau bikin permissions
  public async create({ request, response }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const data = await Module.all()
    CreateRouteHist(request, statusRoutes.FINISH)
    response.ok({ message: "Berhasil mengambil data", data })
  }

  public async store({ request, response }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const createModuleSchema = schema.create({
      id: schema.string([
        rules.unique({ table: 'modules', column: 'id' }),
        rules.alphaNum({ allow: ['underscore', 'dash'] })
      ]),
      description: schema.string.optional()
    })

    const payload = await request.validate({ schema: createModuleSchema })

    try {
      const data = await Module.create(payload)
      CreateRouteHist(request, statusRoutes.FINISH)
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      CreateRouteHist(request, statusRoutes.ERROR, error.message || error)
      response.badRequest({ message: "Gagal menyimpan data", error })
    }
  }

  public async show({ request, params, response }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const { id } = params
    try {
      const data = await Module.query().preload('menus', query => query.preload('functions')).where('id', id)
      CreateRouteHist(request, statusRoutes.FINISH)
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      CreateRouteHist(request, statusRoutes.ERROR, error.message || error)
      console.log(error);
      response.badRequest({ message: "Gagal mengambil data", error })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    try {
      const { id } = params
      const updateModuleScheme = schema.create({
        id: schema.string.optional({}, [
          rules.unique({ table: 'modules', column: 'id' }),
          rules.alphaNum({ allow: ['underscore', 'dash'] })
        ]),
        description: schema.string.nullableAndOptional()
      })

      const payload = await request.validate({ schema: updateModuleScheme })

      await Module.findOrFail(id)

      if (JSON.stringify(payload) === '{}') {
        console.log("data update module kosong");
        return response.badRequest({ message: "Data tidak boleh kosong" })
      }

      let newData = {}
      if (payload.id) { Object.assign(newData, { id: payload.id }) }
      if (payload.description) { Object.assign(newData, { description: payload.description }) }

      await Module.query().where('id', id).update(newData)

      response.ok({ message: "Berhasil mengubah data" })
    } catch (error) {
      response.badRequest({ message: "Gagal mengubah data", error: error.message })
      console.log(error);
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params
    try {
      const module = await Module.findOrFail(id)
      await module.delete()

      response.ok({ message: "Berhasil mengahpus data" })
    } catch (error) {
      response.badRequest({ message: "Gagal menghapus data", error: error.message })
    }
  }
}
