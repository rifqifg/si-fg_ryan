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

Route.get('/', async ({ auth, response }) => {
  const data = await User.query().preload('roles').where('id', auth.user!.id)
  response.ok({ message: 'you are logged in', data })
}).middleware("auth")

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
Route.get('/auth/google-signin', 'System/UsersController.googleSignIn').as('google.singIn')
Route.get('/auth/google', 'System/UsersController.googleCallback')
Route.post('/auth/logout', 'System/UsersController.logout').as('auth.logout').middleware('auth')
Route.post('/auth/register', 'System/UsersController.register').as('auth.register')
Route.get('/auth/verify-email', 'System/UsersController.verify').as('auth.verify')
Route.post('/auth/reset-password', 'System/UsersController.resetUserPassword').as('auth.resetUserPassword').middleware(['auth'])
Route.get('/admin/get-users', 'System/UsersController.getUsers').as('admin.get-user').middleware('auth')
Route.resource('/division/', 'DivisionsController').as('division').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.resource('/employee/', 'EmployeesController').as('employee').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.resource('employee.divisions', 'EmployeeDivisionsController').as('employee.divisions').only(['store', 'update', 'destroy']).middleware({ '*': ['auth', 'checkRole:admin'] })
Route.resource('/employee-types/', 'EmployeeTypesController').as('employee-type').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.resource('/activity/', 'ActivitiesController').as('activity').apiOnly().middleware({ '*': ['auth', 'checkRole:admin,piket,qa'] })
Route.resource('/presence/', 'PresencesController').as('presence').middleware({ '*': ['auth', 'checkRole:admin,piket,qa'] })
Route.get('/employee-list/', 'EmployeesController.getEmployee').as('employee.list').middleware(['auth', 'checkRole:admin,qa,piket'])
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