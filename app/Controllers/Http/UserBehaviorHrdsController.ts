import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { checkRoleSuperAdmin } from 'App/Helpers/checkRoleSuperAdmin'
import { RolesHelper } from 'App/Helpers/rolesHelper'
import { unitHelper } from 'App/Helpers/unitHelper'
import Activity from 'App/Models/Activity'
import User from 'App/Models/User'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'
import { DateTime } from 'luxon'

export default class UserBehaviorHrdsController {
  public async activity({ response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const user = await User.query().preload('roles', r => r.preload('role')).where('id', auth.use('api').user!.id).firstOrFail()
    const userObject = JSON.parse(JSON.stringify(user))

    const superAdmin = await checkRoleSuperAdmin()
    // const unitIds = await unitHelper()
    const unitLeadIds = await unitHelper("lead")
    const roles = await RolesHelper(userObject)
    const isAdminHrd = roles.includes('admin_hrd')

    let data: object
    if (superAdmin) {
      data = await Activity.query()
        .preload('unit', unit => unit.select('id', 'name'))
        .preload('categoryActivity', categoryActivity => categoryActivity.select('id', 'name'))
    } else {
      data = await Activity.query()
        .preload('unit', unit => unit.select('id', 'name'))
        .preload('categoryActivity', categoryActivity => categoryActivity.select('id', 'name'))
          .whereHas('activityMembers', am => {
            am.where('employee_id', user.employeeId)
              .andWhere('role', 'manager')
          })
          .if((isAdminHrd), q => q.orWhereIn('unit_id', unitLeadIds))
        // .andWhere(query => {
        //   query.whereHas('activityMembers', am => (am.where('employee_id', user.employeeId), am.where('role', 'manager')))
        //     .if(isAdminHrd, query => {
        //       query.orWhereHas('unit', u => u
        //         .whereIn('id', unitIds)
        //         .andWhere(query => query.whereHas('employeeUnits', eu => eu.where('title', 'lead'))))
        //     })
        // })
        // .andWhereIn('unit_id', unitIds)
    }

    CreateRouteHist(statusRoutes.FINISH, dateStart)
    response.ok({ message: "Data Berhasil Didapatkan", data })
  }
}
