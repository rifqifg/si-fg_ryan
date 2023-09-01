/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import User from 'App/Models/User'
import 'Inventory/Routes/inventory'
import 'Academic/Routes/academic'
import 'PPDB/Routes/ppdb'
import UserStudentCandidate from 'App/Modules/PPDB/Models/UserStudentCandidate'

Route.get('/', async ({ auth, response }) => {
  if (auth.use('api').isLoggedIn) {
    const data = await User.query().preload('roles', r => r.select('role_name').preload('role', r => r.select('name', 'permissions'))).where('id', auth.user!.id)
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

    dataObject[0]["role_name"] = name.toString()
    dataObject[0]["role"] = {name: name.toString(), descriptions: descriptions.toString(), permissions: {modules: modulesMerge}}
    delete dataObject[0]["roles"]

    response.ok({ message: 'you are logged in', data: dataObject })
  } else if (auth.use('ppdb_api').isLoggedIn) {
    const data = await UserStudentCandidate.query()
      .preload('roles')
      .preload('studentCandidate')
      .where('id', auth.user!.id)
    response.ok({ message: 'you are logged in as student candidate', data })
  }
}).middleware("auth:api,ppdb_api")

Route.group(() => {
  Route.get('pendaftar-baru', 'PPDBChartsController.pendaftarBaru')
  Route.get('pendaftar-diterima', 'PPDBChartsController.pendaftarDiterima')
  Route.get('siswa-tingkat', 'StudentChartsController.siswaTingkat').namespace('AcademicControllers')
  Route.get('siswa-kehadiran', 'StudentChartsController.siswaKehadiran').namespace('AcademicControllers')
  Route.get('karyawan-kehadiran', 'EmployeeChartsController.karyawanKehadiran')
}).prefix('charts')

Route.get('/wilayah', 'System/WilayahsController.index')
Route.get('/wilayah/:keyword', 'System/WilayahsController.getSelect')
Route.get('/wilayah-all/:keyword', 'System/WilayahsController.getAllByKel')

Route.post('/password-encrypt', 'System/UsersController.password_encrypt').as('passwordEncrypt')
Route.post('/auth/login', 'System/UsersController.login').as('auth.login')
Route.post('/auth/google', 'System/UsersController.googleCallback').as('auth.googleSignIn')
Route.post('/auth/logout', 'System/UsersController.logout').as('auth.logout').middleware('auth')
Route.post('/auth/register', 'System/UsersController.register').as('auth.register')
Route.get('/auth/verify-email', 'System/UsersController.verify').as('auth.verify')
Route.post('/auth/reset-password', 'System/UsersController.resetUserPassword').as('auth.resetUserPassword').middleware(['auth'])
Route.get('/admin/get-users', 'System/UsersController.getUsers').as('admin.get-user').middleware('auth')
Route.resource('/division/', 'DivisionsController').as('division').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.resource('/employee/', 'EmployeesController').as('employee').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.get('/employee-list/', 'EmployeesController.getEmployee').as('employee.list').middleware(['auth', 'checkRole:admin,qa,piket'])
Route.resource('employee.divisions', 'EmployeeDivisionsController').as('employee.divisions').only(['store', 'update', 'destroy']).middleware({ '*': ['auth', 'checkRole:admin'] })
Route.resource('/employee-types/', 'EmployeeTypesController').as('employee-type').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.resource('/activity/', 'ActivitiesController').as('activity').apiOnly().middleware({ '*': ['auth', 'checkRole:admin,piket,qa'] })
Route.resource('/presence/', 'PresencesController').as('presence').middleware({ '*': ['auth', 'checkRole:admin,piket,qa'] })
Route.get('/division-list/', 'DivisionsController.getDivision').as('division.list').middleware(['auth', 'checkRole:admin,qa,piket'])
Route.get('/activity-list/', 'ActivitiesController.getActivity').as('activity.list').middleware(['auth', 'checkRole:admin,piket,qa'])
Route.post('/presence/scan', 'PresencesController.scanRFID').as('presence.scan').middleware(['auth', 'checkRole:admin,piket,qa'])
Route.get('/presence/:id/recap', 'PresencesController.recap').as('presence.recap').middleware(['auth', 'checkRole:admin,piket,qa'])
Route.get('/presence/:id/hours', 'PresencesController.hours').as('presence.hours').middleware(['auth', 'checkRole:admin,piket,qa'])
Route.group(() => {
  Route.shallowResource('modules', 'System/ModulesController').except(['edit']).middleware({ '*': ['auth', 'checkRole:admin'] }).as('modules')
  Route.shallowResource('modules.menus', 'System/MenusController').except(['edit']).middleware({ '*': ['auth', 'checkRole:admin'] }).as('menus')
  Route.shallowResource('menus.functions', 'System/FunctionsController').except(['edit']).middleware({ '*': ['auth', 'checkRole:admin'] }).as('functions')
  Route.resource('/users', 'System/CrudUsersController').middleware({ '*': ['auth', 'checkRole:admin'] }).as('users')
  Route.resource('/roles', 'System/RolesController').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] }).as('roles')
  // Route.post('/roles/:id/permissions', 'System/RolesController.updatePermissions').middleware(['auth', 'checkRole:admin']).as('roles.permissions.update')
  Route.resource('roles.modules', 'System/RolesModulesController').only(['store', 'destroy', 'update']).middleware({ '*': ['auth', 'checkRole:admin'] }).as('roles.modules')
  Route.resource('roles.menus', 'System/RolesMenusController').only(['store', 'destroy', 'update']).middleware({ '*': ['auth', 'checkRole:admin'] }).as('roles.menus')
  Route.resource('roles.functions', 'System/RolesFunctionsController').only(['store', 'destroy', 'update']).middleware({ '*': ['auth', 'checkRole:admin'] }).as('roles.functions')
}).prefix('/system')

Route.shallowResource('template-excels', 'TemplateExcelsController').apiOnly().only(['index']).middleware({ '*': ['auth', 'checkRole:admin'] })
Route.shallowResource('category-activities', 'CategoryActivitiesController').apiOnly().only(['index']).middleware({ '*': ['auth', 'checkRole:admin'] })
Route.shallowResource('activity-members', 'ActivityMembersController').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.get('/get-employees/:activityId', 'ActivityMembersController.getEmployee').middleware(['auth', 'checkRole:admin'])
Route.shallowResource('sub-activities', 'SubActivitiesController').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.post('presences/:activityId/:subActivityId', 'SubActivitiesController.presence').middleware(['auth', 'checkRole:admin'])
Route.delete('multi-delete-presences', 'SubActivitiesController.destroyPresences').middleware(['auth', 'checkRole:admin'])


const datas = {
  "message": "you are logged in",
  "data": [
      {
          "id": "f35529a5-178c-4365-97a9-8ff888d9961b",
          "name": "Admin",
          "email": "admin@hr.smafg.sch.id",
          "employee_id": null,
          "verified": true,
          "division_id": "5bbc92b7-3b44-4ab5-8399-7300a2914809",
          "student_id": null,
          "student_parent_id": null,
          "role_name": "super_admin",
          "role": {
              "name": "super_admin",
              "descriptions": "",
              "permissions": {
                  "modules": [
                      {
                          "id": "mdlHRD",
                          "type": "show",
                          "menus": [
                              {
                                  "id": "mnuEmployee",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddEmployee",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteEmployee",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDetailEmployee",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditEmployee",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnUpdateRFID",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuActivity",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddActivity",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteActivity",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditActivity",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnPresence",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuDivision",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddDivision",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteDivision",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditDivision",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnAddEmployeeToDivision",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteEmployeeFromDivision",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDetailDivision",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditEmployeeFromDivision",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuPresence",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddPresence",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeletePresence",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditPresence",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnExportXLSXPresence",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnRecapPresence",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnTimeout",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuRecapPresence",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnExportXLSXRecapPresence",
                                          "type": "show"
                                      }
                                  ]
                              }
                          ]
                      },
                      {
                          "id": "mdlHRD",
                          "type": "show",
                          "menus": [
                              {
                                  "id": "mnuEmployee",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddEmployee",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteEmployee",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDetailEmployee",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditEmployee",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnUpdateRFID",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuActivity",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddActivity",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteActivity",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditActivity",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnPresence",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuDivision",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddDivision",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteDivision",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditDivision",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnAddEmployeeToDivision",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteEmployeeFromDivision",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDetailDivision",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditEmployeeFromDivision",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuPresence",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddPresence",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeletePresence",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditPresence",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnExportXLSXPresence",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnRecapPresence",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnTimeout",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuRecapPresence",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnExportXLSXRecapPresence",
                                          "type": "show"
                                      }
                                  ]
                              }
                          ]
                      },
                      {
                          "id": "mdlSystem",
                          "type": "show",
                          "menus": [
                              {
                                  "id": "mnuModule",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddModule",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteModule",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditModule",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnMenus",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuRole",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddRole",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteRole",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditRole",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnPermissions",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuUsers",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddUser",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteUser",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditUser",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnResetPassword",
                                          "type": "show"
                                      }
                                  ]
                              }
                          ]
                      },
                      {
                          "id": "mdlTestBE",
                          "type": "show",
                          "menus": [
                              {
                                  "id": "mnuTestBE",
                                  "type": "show",
                                  "functions": []
                              },
                              {
                                  "id": "mnuTestDes",
                                  "type": "show",
                                  "functions": []
                              }
                          ]
                      },
                      {
                          "id": "mdlTestFE",
                          "type": "show",
                          "menus": [
                              {
                                  "id": "mnuTest1",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddTest",
                                          "type": "show"
                                      }
                                  ]
                              }
                          ]
                      },
                      {
                          "id": "mdlInventory",
                          "type": "show",
                          "menus": [
                              {
                                  "id": "mnuAssetLoan",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddAssetLoan",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteAssetLoan",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditAssetLoan",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnReturnAssetLoan",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuAssets",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddAssets",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteAssets",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDetailAssets",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditAssets",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuLoanBatch",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddLoanBatch",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteLoanBatch",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDetailLoanBatch",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditLoanBatch",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuManufacturers",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddManufacturer",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteManufacturer",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditManufacturer",
                                          "type": "show"
                                      }
                                  ]
                              }
                          ]
                      },
                      {
                          "id": "mdlAcademic",
                          "type": "show",
                          "menus": [
                              {
                                  "id": "mnuClasses",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddClass",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteClass",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDetailClass",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditClass",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuStudents",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddStudent",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteStudent",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDetailStudent",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditStudent",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnImportStudent",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuSubjects",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddPelajaran",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDetailPelajaran",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeletePelajaran",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditPelajaran",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuTeachers",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddTeachers",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnAddTeachings",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteTeachers",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteTeachings",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDetailTeachers",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditTeachers",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditTeachings",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuProgramSemester",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddProsem",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditProsem",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteProsem",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDetailProsem",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnAddProsemDetail",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditProsemDetail",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteProsemDetail",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuCurriculum",
                                  "type": "show",
                                  "functions": []
                              },
                              {
                                  "id": "mnuRencanaPengambilanNilai",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddRpn",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditRpn",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteRpn",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuPresenceDaily",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddPresenceDaily",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditPresenceDaily",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeletePresenceDaily",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuRecapsDaily",
                                  "type": "show",
                                  "functions": []
                              },
                              {
                                  "id": "mnuPresencePerSubject",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddPresencePerSubject",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditPresencePerSubject",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeletePresencePerSubject",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuRecapsPerSubject",
                                  "type": "show",
                                  "functions": []
                              },
                              {
                                  "id": "mnuBukuNilai",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAdd",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEdit",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDelete",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuAlumniClass",
                                  "type": "show",
                                  "functions": []
                              },
                              {
                                  "id": "mnuStudentPresencePerSubject",
                                  "type": "show",
                                  "functions": []
                              }
                          ]
                      },
                      {
                          "id": "mdlProfile",
                          "type": "show",
                          "menus": []
                      },
                      {
                          "id": "mdlExecutiveSummary",
                          "type": "show",
                          "menus": [
                              {
                                  "id": "mnuAlumni",
                                  "type": "show",
                                  "functions": []
                              },
                              {
                                  "id": "mnuKaryawan",
                                  "type": "show",
                                  "functions": []
                              },
                              {
                                  "id": "mnuSiswa",
                                  "type": "show",
                                  "functions": []
                              },
                              {
                                  "id": "mnuPPDB",
                                  "type": "show",
                                  "functions": []
                              }
                          ]
                      },
                      {
                          "id": "mdlPpdb",
                          "type": "show",
                          "menus": [
                              {
                                  "id": "mnuJadwal",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnEditJadwal",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnAddJadwal",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDetailJadwal",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteJadwal",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuPendaftaran",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddInterviewAdmin",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteInterviewAdmin",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditInterviewAdmin",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnStatusKeputusanAdmin",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuSetting",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddBatch",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteBatch",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditBatch",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditGuide",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditPendaftaranAktif",
                                          "type": "show"
                                      }
                                  ]
                              }
                          ]
                      }
                  ]
              }
          }
      }
  ]
}
