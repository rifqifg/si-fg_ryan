import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Role from 'App/Models/Role'
import CreateRoleValidator from 'App/Validators/CreateRoleValidator'
import { schema, rules } from '@ioc:Adonis/Core/Validator'


export default class RolesController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", mode = "tree" } = request.qs()

    try {
      let data
      if (mode === "tree") {
        data = await Role
          .query()
          .whereILike('name', `%${keyword}%`)
          .orderBy('name')
          .paginate(page, limit)

      } else {
        data = await Role.query().select('name')

      }
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      console.log(error);

      response.badRequest({ message: "Gagal mengambil data", error })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateRoleValidator)
    payload['permissions'] = { modules: [] }  //predefined untuk bikin permissions
    try {
      const data = await Role.create(payload)
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      response.badRequest({ message: "Gagal menyimpan data", error })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params
    try {
      const data = await Role.findOrFail(id)
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      console.log(error);
      response.badRequest({ message: "Gagal mengambil data", error: error.message })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    try {
      const { id } = params
      const updateRolesScheme = schema.create({
        name: schema.string.optional({}, [
          rules.unique({ table: 'roles', column: 'name' }),
          rules.alphaNum({ allow: ['underscore', 'dash'] })
        ]),
        description: schema.string.nullableAndOptional()
      })

      const payload = await request.validate({ schema: updateRolesScheme })
      await Role.findOrFail(id)

      let newData = {}
      if (payload.name) { Object.assign(newData, { name: payload.name }) }
      if (payload.description) { Object.assign(newData, { description: payload.description }) }

      await Role.query().where('name', id).update(newData)

      response.ok({ message: "Berhasil mengubah data" })
    } catch (error) {
      response.badRequest({ message: "Gagal mengubah data", error: error.message })
      console.log(error);
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params
    try {
      const role = await Role.findOrFail(id)
      await role.delete()

      response.ok({ message: "Berhasil mengahpus data" })
    } catch (error) {
      response.badRequest({ message: "Gagal menghapus data", error: error.message })
    }
  }


  // public async updatePermissions({ params, request, response }: HttpContextContract) {
  //   const { id } = params
  //   const updatePermissionsScheme = schema.create({
  //     permissions: schema.array().members(
  //       schema.object().members({
  //         id: schema.string({}, [rules.exists({ table: "modules", column: "id" })]),
  //         type: schema.enum(['show', 'disabled']),
  //         menus: schema.array.nullableAndOptional().members(
  //           schema.object().members({
  //             id: schema.string({}, [rules.exists({ table: 'menus', column: 'id' })]),
  //             type: schema.enum(['show', 'disabled']),
  //             functions: schema.array.nullableAndOptional().members(
  //               schema.object().members({
  //                 id: schema.string({}, [rules.exists({ table: 'functions', column: 'id' })]),
  //                 type: schema.enum(['show', 'disabled']),
  //               }))
  //           }))
  //       }))
  //   })

  //   const payload = await request.validate({ schema: updatePermissionsScheme })
  //   const jsonPayload = JSON.stringify(payload)
  //   const data = await Role.findOrFail(id)

  //   try {
  //     await data.merge({ permissions: jsonPayload }).save()
  //     response.ok({ message: "Permissions berhasil di simpan", data })
  //   } catch (error) {
  //     console.log(error);
  //     response.badRequest({ message: "Gagal menyimpan data permissions", error: error.message })
  //   }

  //   response.ok({ message: "Berhasil mengubah data", id })
  // }
}
