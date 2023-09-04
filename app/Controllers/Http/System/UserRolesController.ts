import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserRole from 'App/Models/UserRole';
import CreateUserRoleValidator from 'App/Validators/CreateUserRoleValidator'

export default class UserRolesController {
  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateUserRoleValidator)

    try {
      const data = await UserRole.create(payload)

      response.ok({ message: "Role created successfully", data })
    } catch (error) {
      const message = "SYSUR01: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal Menambah Data",
        error: message,
      });
    }
  }
  public async destroy({ params, response }: HttpContextContract) {
    const { userId, roleName } = params

    try {
      await UserRole.query()
        .where('user_id', userId)
        .andWhere('role_name', roleName)
        .delete()

      response.ok({ message: 'Berhasil menghapus data' })
    } catch (error) {
      const message = "SYSUR02: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal Menambah Data",
        error: message,
      });
    }
  }
}
