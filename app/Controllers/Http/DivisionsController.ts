import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Division from 'App/Models/Division'
import { schema, rules } from '@ioc:Adonis/Core/Validator'


export default class DivisionsController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", orderBy = "name", orderDirection = 'ASC' } = request.qs()
    const data = await Division.query()
      .preload('pic_detail', query => { query.select('id', 'name') })
      .whereILike('name', `%${keyword}%`)
      .orderBy(orderBy, orderDirection)
      .paginate(page, limit)

    response.ok({ message: "Data Berhasil Didapatkan", data })
  }

  public async getDivision({ request, response }: HttpContextContract) {
    const { keyword = "" } = request.qs()
    try {
      const data = await Division.query()
        .preload('pic_detail', query => { query.select('id', 'name') })
        .whereILike('name', `%${keyword}%`)
        .orderBy('name')

      response.ok({ message: "Get Data Success", data })
    } catch (error) {
      console.log(error);
      response.badRequest(error)
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const createNewDivisionSchema = schema.create({
      name: schema.string({ trim: true }, [
        rules.minLength(2)
      ]),
      description: schema.string.optional({}, [rules.minLength(6)]),
      pic: schema.string.optional({}, [
        rules.exists({ table: 'employees', column: 'id' })
      ])
    })

    const payload = await request.validate({ schema: createNewDivisionSchema })

    try {
      const data = await Division.create(payload)
      response.ok({ message: "Create data success", data })
    } catch (error) {
      console.log(error);
      return response.internalServerError(error)
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params
    try {
      const data = await Division.query().preload('pic_detail').where('id', id)
      response.ok({ message: "Get data success", data })
    } catch (error) {
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
      pic: schema.string.optional({}, [
        rules.exists({ table: 'employees', column: 'id' })
      ])
    })

    const payload = await request.validate({ schema: createNewDivisionSchema })

    try {
      const data = await Division.findOrFail(id)
      await data.merge(payload).save()

      response.ok({ message: "Update data success", data })
    } catch (error) {
      return response.internalServerError(error)
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
