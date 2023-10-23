import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Role from 'App/Models/Role'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'

export default class RolesModulesController {
  public async store({ params, request, response }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const { role_id } = params

    const addRoleModuleSchema = schema.create({
      id: schema.string([
        rules.exists({ table: 'modules', column: 'id' })
      ]),
      type: schema.enum(['show', 'disabled'])
    })

    const payload = await request.validate({ schema: addRoleModuleSchema })
    payload['menus'] = []

    const roles = await Role.findOrFail(role_id)
    const { permissions } = roles
    permissions['modules'].push(payload)

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

    const changeModuleTypeSchema = schema.create({
      type: schema.enum(['show', 'disabled'])
    })

    const payload = await request.validate({ schema: changeModuleTypeSchema })

    const roles = await Role.findOrFail(role_id)
    const { permissions } = roles

    permissions['modules'].map(p => {
      if (p.id === id) {
        p.type = payload.type
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

  public async destroy({ params, response }: HttpContextContract) {
    const { role_id, id } = params
    const roles = await Role.findOrFail(role_id)
    const { permissions } = roles
    const filteredModules = permissions['modules'].filter(p => p.id !== id)
    permissions['modules'] = filteredModules

    try {
      await roles.merge({ permissions: permissions }).save()
      response.ok({ message: 'Permissions updated successfully', roles })
    } catch (error) {
      console.log("roles_modules.store ", error);
      response.badRequest(error)
    }
  }
}
