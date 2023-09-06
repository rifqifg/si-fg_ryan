import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class CheckRole {
  public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>, allowedRole?: string[]) {
    const user = await User.query().preload('roles', r => r.preload('role')).where('id', auth.use('api').user!.id).firstOrFail()

    const userObject = JSON.parse(JSON.stringify(user))
    let hasAllowedRole = false;

    userObject.roles.map(async value => {
      const {role_name} = value
      // Sementara di lost dulu // allowedRole?.find(v => v == role_name)
      if (role_name == 'super_admin' || allowedRole) {
        hasAllowedRole = true;
        return;
      }
    })
    if (hasAllowedRole) {
      await next();
    } else {
      return response.unauthorized({
        code: "ROLE",
        message: "Anda tidak berhak mengakses halaman ini"
      });
    }
  }
}
