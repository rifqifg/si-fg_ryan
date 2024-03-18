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
import 'Inventory/Routes/inventory'
import 'Academic/Routes/academic'
import 'PPDB/Routes/ppdb'
import 'Finance/Routes/finance'
import 'Foundation/Routes/foundation'

Route.get('/', 'DashboardController.index').middleware("auth:api,ppdb_api,parent_api")

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
Route.get('/auth/login-parent', 'System/UsersController.loginParent').as('auth.loginParent')
Route.post('/auth/google', 'System/UsersController.googleCallback').as('auth.googleSignIn')
Route.post('/auth/logout', 'System/UsersController.logout').as('auth.logout').middleware('auth')
Route.post('/auth/logout-parent', 'System/UsersController.logoutParent').as('auth.logoutParent').middleware('auth:parent_api')
Route.post('/auth/register', 'System/UsersController.register').as('auth.register')
Route.get('/auth/verify-email', 'System/UsersController.verify').as('auth.verify')
Route.post('/auth/reset-password', 'System/UsersController.resetUserPassword').as('auth.resetUserPassword').middleware(['auth'])
Route.get('/admin/get-users', 'System/UsersController.getUsers').as('admin.get-user').middleware('auth')
Route.resource('/division/', 'DivisionsController').as('division').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.resource('/employee/', 'EmployeesController').as('employee').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.get('/employee-list/', 'EmployeesController.getEmployee').as('employee.list').middleware(['auth', 'checkRole:admin,qa,piket'])
Route.put('/employee-divisions',  'EmployeeDivisionsController.update').middleware(['auth', 'checkRole:admin'])
Route.resource('/employee-divisions', 'EmployeeDivisionsController').as('employee.divisions').only(['index', 'store', 'destroy']).middleware({ '*': ['auth', 'checkRole:admin'] })
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
  Route.post('user-roles/:userId', 'System/UserRolesController.store').middleware(['auth', 'checkRole:admin'])
  Route.delete('user-roles/:userId/:roleName', 'System/UserRolesController.destroy').middleware(['auth', 'checkRole:admin'])
}).prefix('/system')

Route.shallowResource('template-excels', 'TemplateExcelsController').apiOnly().only(['index']).middleware({ '*': ['auth', 'checkRole:admin'] })
Route.shallowResource('category-activities', 'CategoryActivitiesController').apiOnly().only(['index']).middleware({ '*': ['auth', 'checkRole:admin'] })
Route.shallowResource('activity-members', 'ActivityMembersController').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.get('/get-employees/:activityId', 'ActivityMembersController.getEmployee').middleware(['auth', 'checkRole:admin'])
Route.get('/get-member-and-employees', 'ActivityMembersController.getActivityMemberAndEmployee').middleware(['auth', 'checkRole:admin'])
Route.shallowResource('sub-activities', 'SubActivitiesController').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.get('presences', 'SubActivitiesController.getPresenceSubActivity').middleware(['auth', 'checkRole:admin'])
Route.post('presences/:activityId/:subActivityId', 'SubActivitiesController.presence').middleware(['auth', 'checkRole:admin'])
Route.delete('multi-delete-presences', 'SubActivitiesController.destroyPresences').middleware(['auth', 'checkRole:admin'])
Route.get('recap-sub-activities/:activityId', 'SubActivitiesController.recap').middleware(['auth', 'checkRole:admin'])
Route.shallowResource('leaves', 'LeavesController').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.shallowResource('leave-sessions', 'LeaveSessionsController').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.shallowResource('monthly-reports', 'MonthlyReportsController').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.shallowResource('monthly-report-employees', 'MonthlyReportEmployeesController').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.shallowResource('monthly-report-employee-details', 'MonthlyReportEmployeeDetailsController').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })

Route.shallowResource('triwulans', 'TriwulansController').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.shallowResource('assessment-components', 'AssessmentComponentsController').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.shallowResource('triwulan-employees', 'TriwulanEmployeesController').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.shallowResource('triwulan-employee-details', 'TriwulanEmployeeDetailsController').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.get('triwulans/:id/recaps', 'TriwulansController.recaps').as('triwulan.recaps').middleware(['auth', 'checkRole:admin'])
Route.shallowResource('units', 'UnitsController').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.delete('unit-delete-image/:id', 'UnitsController.deleteImage').middleware(['auth', 'checkRole:admin'])
Route.get('unit-lists', 'UnitsController.getUnit').as('unit.list').middleware(['auth', 'checkRole:admin'])
Route.get('unit-lists-lead-only', 'UnitsController.getUnitLeadOnly').as('unit.list-lead').middleware(['auth', 'checkRole:admin'])
Route.shallowResource('employee-units', 'EmployeeUnitsController').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.get('list-employee-units', 'EmployeeUnitsController.getListEmployeeUnits').middleware(['auth'])
Route.get('/employees-not-in-unit/', 'EmployeesController.getEmployeesNotInUnit').middleware(['auth'])
Route.get('/employees-not-in-division/', 'EmployeesController.getEmployeesNotInDivision').middleware(['auth'])
Route.get('/dashboard/status-employee', 'DashboardHrdsController.statusEmployee').middleware(['auth'])
Route.get('/dashboard/total-employees', 'DashboardHrdsController.totalEmployee').middleware(['auth'])

Route.group(() => {
  Route.get('activities', 'UserBehaviorHrdsController.activity').middleware(['auth'])
}).prefix('/user-behavior-hrd')

Route.shallowResource('/notifications', 'NotificationsController').middleware({ '*': ['auth'] })
Route.put('/notification/batch', 'NotificationsController.updateBatch').middleware(['auth'])
