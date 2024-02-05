import { HttpContext } from "@adonisjs/core/build/standalone"
import User from "App/Models/User"

export const checkRoleSuperAdmin = async () => {
  const { auth } = HttpContext.get()!

  const user = await User.query().preload('roles', r => r.preload('role')).where('id', auth.use('api').user!.id).firstOrFail()
  const userObject = JSON.parse(JSON.stringify(user))

  for (let i = 0; i < userObject.roles.length; i++) {
    if (userObject.roles[i].role_name === "super_admin") {
      return true; // Memiliki peran "super_admin"
    }
  }
  return false;
}
