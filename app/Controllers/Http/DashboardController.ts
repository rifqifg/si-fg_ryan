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
