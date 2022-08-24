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

Route.get('/', async ({ auth }) => {
  return { hello: 'you are logged in', data: auth.user }

}).middleware("auth")

Route.post('/password-encrypt', 'System/UsersController.password_encrypt').as('passwordEncrypt')
Route.post('/auth/login', 'System/UsersController.login').as('auth.login')
Route.post('/auth/logout', 'System/UsersController.logout').as('auth.logout').middleware('auth')
Route.post('/auth/register', 'System/UsersController.register').as('auth.register')
Route.post('/auth/reset-password', 'System/UsersController.resetUserPassword').as('auth.resetUserPassword').middleware(['auth', 'checkRole:admin'])
Route.get('/admin/get-users', 'System/UsersController.getUsers').as('admin.get-user').middleware('auth')
Route.resource('/division/', 'DivisionsController').as('division').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.resource('/employee/', 'EmployeesController').as('employee').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.resource('/activity/', 'ActivitiesController').as('activity').apiOnly().middleware({ '*': ['auth', 'checkRole:admin,piket,qa'] })
Route.resource('/presence/', 'PresencesController').as('presence').middleware({ '*': ['auth', 'checkRole:admin,piket,qa'] })
Route.get('/employee-list/', 'EmployeesController.getEmployee').as('employee.list').middleware(['auth', 'checkRole:admin,qa,piket'])
Route.get('/division-list/', 'DivisionsController.getDivision').as('division.list').middleware(['auth', 'checkRole:admin,qa,piket'])
Route.get('/activity-list/', 'ActivitiesController.getActivity').as('activity.list').middleware(['auth', 'checkRole:admin,piket,qa'])
Route.post('/presence/scan', 'PresencesController.scanRFID').as('presence.scan').middleware(['auth', 'checkRole:admin,piket,qa'])
Route.get('/presence/:id/recap', 'PresencesController.recap').as('presence.recap').middleware(['auth', 'checkRole:admin,piket,qa'])
Route.group(() => {
  Route.shallowResource('modules', 'System/ModulesController').except(['edit']).middleware({ '*': ['auth', 'checkRole:admin,superAdmin'] }).as('modules')
  Route.shallowResource('modules.menus', 'System/MenusController').except(['edit']).middleware({ '*': ['auth', 'checkRole:admin,superAdmin'] }).as('menus')
  Route.shallowResource('menus.functions', 'System/FunctionsController').except(['edit']).middleware({ '*': ['auth', 'checkRole:admin,superAdmin'] }).as('functions')
  Route.resource('/roles', 'System/RolesController').apiOnly().middleware({ '*': ['auth', 'checkRole:admin,superAdmin'] }).as('roles')
  Route.post('/roles/:id/permissions', 'System/RolesController.updatePermissions').middleware(['auth', 'checkRole:admin,superAdmin']).as('roles.permissions.update')
}).prefix('/system')


// be api > https://localhost:3000/module/{{id_module}}/menu/{{id_menu}}/function/
// GET   > https://localhost:3000/module/
// GET   > https://localhost:3000/module/{{id_module}}
// GET   > https://localhost:3000/module/{{id_module}}/menu
// GET   > https://localhost:3000/module/{{id_module}}/menus/{{id_menu}}
// GET   > https://localhost:3000/module/{{id_module}}/menus/{{id_menu}}/function/