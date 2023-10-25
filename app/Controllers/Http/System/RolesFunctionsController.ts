import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Role from 'App/Models/Role'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'


export default class RolesFunctionsController {
  public async store({ params, request, response }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const { role_id } = params
    const { idModule, idMenu } = request.body()

    const addRoleFunctionSchema = schema.create({
      idModule: schema.string([
        rules.exists({ table: 'modules', column: 'id' })
      ]),
      idMenu: schema.string([
        rules.exists({ table: 'menus', column: 'id', where: { "module_id": idModule } })
      ]),
      id: schema.string([
        rules.exists({ table: 'functions', column: 'id', where: { "menu_id": idMenu } })
      ]),
      type: schema.enum(['show', 'disabled'])
    })

    const payload = await request.validate({ schema: addRoleFunctionSchema })

    const roles = await Role.findOrFail(role_id)
    const { permissions } = roles
    permissions['modules'].map(module => {
      if (module.id === payload.idModule) {
        module.menus.map(menu => {
          if (menu.id === payload.idMenu) {
            menu.functions.push({
              id: payload.id,
              type: payload.type,
            })

          }
        })
      }
    })

    try {
      await roles.merge({ permissions: permissions }).save()
      CreateRouteHist(request, statusRoutes.FINISH)
      response.ok({ message: 'Permissions updated successfully', roles })
    } catch (error) {
      CreateRouteHist(request, statusRoutes.ERROR, error.message || error)
      console.log("roles_functions.store ", error);
      response.badRequest(error)
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { role_id, id } = params

    const addRoleFunctionSchema = schema.create({
      idModule: schema.string(),
      idMenu: schema.string(),
      type: schema.enum(['show', 'disabled'])
    })

    const payload = await request.validate({ schema: addRoleFunctionSchema })

    const roles = await Role.findOrFail(role_id)
    const { permissions } = roles
    permissions['modules'].map(module => {
      if (module.id === payload.idModule) {
        module.menus.map(menu => {
          if (menu.id === payload.idMenu) {
            menu.functions.map(fungsi => {
              if (fungsi.id === id) {
                fungsi.type = payload.type
              }
            })
          }
        })
      }
    })

    try {
      await roles.merge({ permissions: permissions }).save()
      response.ok({ message: 'Permissions updated successfully', roles })
    } catch (error) {
      console.log("roles_functions.store ", error);
      response.badRequest(error)
    }

  }

  public async destroy({ params, request, response }: HttpContextContract) {
    const { role_id, id } = params

    const addRoleFunctionSchema = schema.create({
      idModule: schema.string(),
      idMenu: schema.string(),
    })

    const payload = await request.validate({ schema: addRoleFunctionSchema })

    const roles = await Role.findOrFail(role_id)
    const { permissions } = roles
    permissions['modules'].map(module => {
      if (module.id === payload.idModule) {
        module.menus.map(menu => {
          if (menu.id === payload.idMenu) {
            menu.functions = menu.functions.filter(fungsi => fungsi.id !== id)
          }
        })
      }
    })

    try {
      await roles.merge({ permissions: permissions }).save()
      response.ok({ message: 'Permissions updated successfully', roles })
    } catch (error) {
      console.log("roles_functions.store ", error);
      response.badRequest(error)
    }

  }
}
