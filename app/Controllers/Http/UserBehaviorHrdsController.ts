import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Activity from 'App/Models/Activity'
import User from 'App/Models/User'

export default class UserBehaviorHrdsController {
  public async activity({ response, auth }: HttpContextContract) {
    const user = await User.query().preload('roles', r => r.preload('role')).where('id', auth.use('api').user!.id).firstOrFail()
    const userObject = JSON.parse(JSON.stringify(user))

    let data: object

    if (userObject.roles[0].role_name == 'super_admin') {
      data = await Activity.query()
        .preload('division', division => division.select('id', 'name'))
        .preload('categoryActivity', categoryActivity => categoryActivity.select('id', 'name'))
    } else {
      data = await Activity.query()
        .preload('division', division => division.select('id', 'name'))
        .preload('categoryActivity', categoryActivity => categoryActivity.select('id', 'name'))
        .whereHas('activityMembers', am => (am.where('employee_id', user.employeeId), am.where('role', 'manager')))
    }

    response.ok({ message: "Data Berhasil Didapatkan", data })
  }
}
