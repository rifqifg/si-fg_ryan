import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Role from 'App/Models/Role'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'


export default class RolesMenusController {
  public async store({ params, request, response }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const { role_id } = params
    const { idModule } = request.body()

    const addRoleMenuSchema = schema.create({
      idModule: schema.string([
        rules.exists({ table: 'modules', column: 'id' })
      ]),
      id: schema.string([
        rules.exists({ table: 'menus', column: 'id', where: { "module_id": idModule } })
      ]),
      type: schema.enum(['show', 'disabled'])
    })

    const payload = await request.validate({ schema: addRoleMenuSchema })

    const roles = await Role.findOrFail(role_id)
    const { permissions } = roles
    permissions['modules'].map(module => {
      if (module.id === payload.idModule) {
        module["menus"].push({
          id: payload.id,
          type: payload.type,
          functions: []
        })
      }
    })

    try {
      await roles.merge({ permissions: permissions }).save()
      CreateRouteHist(request, statusRoutes.FINISH)
      response.ok({ message: 'Permissions updated successfully', roles })
    } catch (error) {
      CreateRouteHist(request, statusRoutes.ERROR, error.message || error)
      console.log("roles_modules.store ", error);
      response.badRequest(error)
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { role_id, id } = params

    const changeMenuTypeSchema = schema.create({
      idModule: schema.string(),
      type: schema.enum(['show', 'disabled'])
    })

    const payload = await request.validate({ schema: changeMenuTypeSchema })

    const roles = await Role.findOrFail(role_id)
    const { permissions } = roles
    permissions['modules'].map(module => {
      if (module.id === payload.idModule) {
        module["menus"].map(menu => {
          if (menu.id === id) {
            menu.type = payload.type
          }
        })
      }
    })

    try {
      await roles.merge({ permissions: permissions }).save()
      response.ok({ message: 'Permissions updated successfully', roles })
    } catch (error) {
      console.log("roles_modules.store ", error);
      response.badRequest(error)
    }
  }

  public async destroy({ params, request, response }: HttpContextContract) {
    const { role_id, id } = params

    const changeMenuTypeSchema = schema.create({
      idModule: schema.string(),
    })

    const payload = await request.validate({ schema: changeMenuTypeSchema })

    const roles = await Role.findOrFail(role_id)
    const { permissions } = roles
    permissions['modules'].map(module => {
      if (module.id === payload.idModule) {
        module["menus"] = module["menus"].filter(menu => menu.id !== id)
      }
    })

    try {
      await roles.merge({ permissions: permissions }).save()
      response.ok({ message: 'Permissions updated successfully', roles })
    } catch (error) {
      console.log("roles_modules.store ", error);
      response.badRequest(error)
    }
  }
}
