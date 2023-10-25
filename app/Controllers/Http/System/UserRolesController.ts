import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserRole from 'App/Models/UserRole';
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist';
import { statusRoutes } from 'App/Modules/Log/lib/enum';
import CreateUserRoleValidator from 'App/Validators/CreateUserRoleValidator'

export default class UserRolesController {
  public async store({ request, response, params }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const { userId } = params

    const payload = await request.validate(CreateUserRoleValidator)
    const datas: any = []

    payload.userRoles.map(role => {
      datas.push({
        userId: userId,
        roleName: role
      })
    })

    try {
      const data = await UserRole.createMany(datas)
      CreateRouteHist(request, statusRoutes.FINISH)
      response.ok({ message: "Role created successfully", data })
    } catch (error) {
      const message = "SYSUR01: " + error.message || error;
      CreateRouteHist(request, statusRoutes.ERROR, message)
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
