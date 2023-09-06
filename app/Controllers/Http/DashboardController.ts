import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import UserStudentCandidate from 'App/Modules/PPDB/Models/UserStudentCandidate'
import Account from 'App/Modules/Finance/Models/Account'
import Database from '@ioc:Adonis/Lucid/Database'

export default class DashboardController {
  public async index({ auth, response }: HttpContextContract) {
    if (auth.use('api').isLoggedIn) {
      const data = await User.query().preload('roles', r => r.select('role_name').orderBy('role_name', 'asc').preload('role', r => r.select('name', 'permissions'))).where('id', auth.user!.id)
      const dataObject = JSON.parse(JSON.stringify(data))
      const roles =  dataObject[0].roles
      const name:any = []
      const descriptions:any = []
      const modules = roles.reduce((prev, v) => {
        name.push(v.role_name)
        descriptions.push(v.descriptions)
        return [...prev, v.role.permissions.modules]
      }, [])
      const modulesMerge:any = []
      modules.map(value => {
        value.map(m => {
          modulesMerge.push(m)
        })
      })

      const simplifiedModules = {};

      modulesMerge.forEach(module => {
        if (!simplifiedModules[module.id]) {
          simplifiedModules[module.id] = { id: module.id, type: "", menus: [] };
        }

        if (module.type === "show" && simplifiedModules[module.id].type !== "disabled") {
          simplifiedModules[module.id].type = "show";
        } else if (module.type === "disabled" && simplifiedModules[module.id].type !== "show") {
          simplifiedModules[module.id].type = "disabled";
        }

        if (module.menus) {
          module.menus.forEach(menu => {
            const existingMenu = simplifiedModules[module.id].menus.find(existing => existing.id === menu.id);
            if (!existingMenu) {
              const simplifiedMenu: any = { id: menu.id, type: "" };
              if (menu.type === "show" && simplifiedMenu.type !== "disabled") {
                simplifiedMenu.type = "show";
              } else if (menu.type === "disabled" && simplifiedMenu.type !== "show") {
                simplifiedMenu.type = "disabled";
              }

              if (menu.functions) {
                simplifiedMenu.functions = menu.functions.reduce((acc, func) => {
                  if (func.type !== "disabled" && !acc.find(f => f.id === func.id)) {
                    acc.push({ id: func.id, type: func.type });
                  }
                  return acc;
                }, []);
              }

              simplifiedModules[module.id].menus.push(simplifiedMenu);
            } else {
              if (menu.type === "show" && existingMenu.type !== "disabled") {
                existingMenu.type = "show";
              } else if (menu.type === "disabled" && existingMenu.type !== "show") {
                existingMenu.type = "disabled";
              }

              if (menu.functions) {
                menu.functions.forEach(func => {
                  if (func.type !== "disabled" && !existingMenu.functions.find(f => f.id === func.id)) {
                    existingMenu.functions.push({ id: func.id, type: func.type });
                  }
                });
              }
            }
          });
        }
      });

      const modulesSimple = Object.values(simplifiedModules);

      dataObject[0]["role_name"] = name.toString()
      dataObject[0]["role"] = {name: name.toString(), descriptions: descriptions.toString(), permissions: {modules: modulesSimple}}
      delete dataObject[0]["roles"]

      response.ok({ message: 'you are logged in', data: dataObject })
    } else if (auth.use('ppdb_api').isLoggedIn) {
      const data = await UserStudentCandidate.query()
        .preload('roles')
        .preload('studentCandidate')
        .where('id', auth.user!.id)
      response.ok({ message: 'you are logged in as student candidate', data })
    } else if (auth.use('parent_api').isLoggedIn) {
      const data = await Account.query()
        .select('*')
        .select(Database.rawQuery(`(select json_build_object(
            'name', name,
            'description', description,
            'permissions', permissions
          ) from public.roles r where name = 'parent') as roles`))
        .preload('student', qStudent => qStudent.select('name'))
        .where('id', auth.user!.id)
      response.ok({ message: 'you are logged in as parent', data })
    }
  }
}
