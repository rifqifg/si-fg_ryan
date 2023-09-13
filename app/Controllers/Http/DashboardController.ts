import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import UserStudentCandidate from 'App/Modules/PPDB/Models/UserStudentCandidate'
import Account from 'App/Modules/Finance/Models/Account'
import Database from '@ioc:Adonis/Lucid/Database'

export default class DashboardController {
  public async index({ auth, response }: HttpContextContract) {
    if (auth.use('api').isLoggedIn) {
      const data = await User.query().preload('roles', r => r.select('role_name').preload('role', r => r.select('name', 'permissions'))).where('id', auth.user!.id)
      const dataObject = JSON.parse(JSON.stringify(data))
      const roles = dataObject[0].roles
      const name: any = []
      const descriptions: any = []
      const modules = roles.reduce((prev, v) => {
        name.push(v.role_name)
        descriptions.push(v.descriptions)
        return [...prev, v.role.permissions.modules]
      }, [])
      const modulesMerge: any = []
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

        if (module.type === "show") {
          if (simplifiedModules[module.id].type === "") {
            simplifiedModules[module.id].type = "show";
          } else if (simplifiedModules[module.id].type === "show") {
            simplifiedModules[module.id].type = "show";
          } else if (simplifiedModules[module.id].type === "disabled") {
            simplifiedModules[module.id].type = "show";
          }
        } else if (module.type === "disabled") {
          if (simplifiedModules[module.id].type === "") {
            simplifiedModules[module.id].type = "disabled";
          } else if (simplifiedModules[module.id].type === "show") {
            simplifiedModules[module.id].type = "show";
          } else if (simplifiedModules[module.id].type === "disabled") {
            simplifiedModules[module.id].type = "disabled";
          }
        }

        if (module.menus) {
          module.menus.forEach(menu => {
            const existingMenu = simplifiedModules[module.id].menus.find(existing => existing.id === menu.id);

            if (!existingMenu) {
              const simplifiedMenu: any = { id: menu.id, type: "", functions: [] };

              if (menu.type === "show") {
                if (simplifiedMenu.type === "") {
                  simplifiedMenu.type = "show";
                } else if (simplifiedMenu.type === "show") {
                  simplifiedMenu.type = "show";
                } else if (simplifiedMenu.type === "disabled") {
                  simplifiedMenu.type = "show";
                }
              } else if (menu.type === "disabled") {
                if (simplifiedMenu.type === "") {
                  simplifiedMenu.type = "disabled";
                } else if (simplifiedMenu.type === "show") {
                  simplifiedMenu.type = "show";
                } else if (simplifiedMenu.type === "disabled") {
                  simplifiedMenu.type = "disabled";
                }
              }

              menu.functions.forEach(func => {
                const simplifiedFunction: any = { id: func.id, type: "" };

                if (func.type === "show") {
                  if (simplifiedFunction.type === "") {
                    console.log("masuk 1");
                    simplifiedFunction.type = "show";
                  } else if (simplifiedFunction.type === "show") {
                    console.log("masuk 2");
                    simplifiedFunction.type = "show";
                  } else if (simplifiedFunction.type === "disabled") {
                    console.log("masuk 3");
                    simplifiedFunction.type = "show";
                  }
                } else if (func.type === "disabled") {
                  if (simplifiedFunction.type === "") {
                    console.log("masuk 4");
                    simplifiedFunction.type = "disabled";
                  } else if (simplifiedFunction.type === "show") {
                    console.log("masuk 5");
                    simplifiedFunction.type = "show";
                  } else if (simplifiedFunction.type === "disabled") {
                    console.log("masuk 6");
                    simplifiedFunction.type = "disabled";
                  }
                }

                simplifiedMenu.functions.push(simplifiedFunction);
              })

              simplifiedModules[module.id].menus.push(simplifiedMenu);
            } else {
              if (menu.type === "show") {
                if (existingMenu.type === "show") {
                  existingMenu.type = "show";
                } else if (existingMenu.type === "disabled") {
                  existingMenu.type = "show";
                }
              } else if (menu.type === "disabled") {
                if (existingMenu.type === "show") {
                  existingMenu.type = "show";
                } else if (existingMenu.type === "disabled") {
                  existingMenu.type = "disabled";
                }
              }

              if (menu.functions) {

                menu.functions.forEach(func => {
                  const existingFunc = existingMenu.functions.find(f => f.id === func.id);

                  if (!existingFunc) {
                    existingMenu.functions.push({ id: func.id, type: func.type });
                  } else if (func.type === "show") {
                    existingFunc.type = "show";
                  }
                });
              }
            }
          });
        }
      });

      const modulesSimple = Object.values(simplifiedModules);

      dataObject[0]["role_name"] = name.toString()
      dataObject[0]["role"] = { name: name.toString(), descriptions: descriptions.toString(), permissions: { modules: modulesSimple } }
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
