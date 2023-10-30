import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import UserRole from 'App/Models/UserRole'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'
import CreateUserValidator from 'App/Validators/CreateUserValidator'
import UpdateUserValidator from 'App/Validators/UpdateUserValidator'
import { DateTime } from 'luxon'

export default class CrudUsersController {
  public async index({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
   CreateRouteHist(statusRoutes.START, dateStart)
    const { page = 1, limit = 10, keyword = "" } = request.qs()

    try {
      const data = await User
        .query()
        .preload('roles', role => role.select("role_name"))
        .preload('employee', employee => employee.preload('divisions'))
        .preload('division', division => division.select('id', 'name'))
        .whereILike('name', `%${keyword}%`)
        .orderBy('name')
        .paginate(page, limit)

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      response.badRequest({ message: "Gagal mengambil data", error })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
   CreateRouteHist(statusRoutes.START, dateStart)
    const { id } = params
    try {
      const data = await User.query()
        .preload('employee')
        .preload('roles', roles => roles.select('role_name'))
        .preload('division', division => division.select('id', 'name'))
        .where('id', id).firstOrFail()

        CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      console.log(error);
      response.badRequest({ message: "Gagal mengambil data", error: error.message })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
   CreateRouteHist(statusRoutes.START, dateStart)
    const payload = await request.validate(CreateUserValidator)
    const roles = payload.role
    //@ts-ignore
    delete payload.role
    try {
      const data = await User.create(payload)
      const dataObject = JSON.parse(JSON.stringify(data))
      roles.map(async role => {
        await UserRole.create({
          userId: dataObject.id,
          roleName: role
        })
      })

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      response.badRequest({ message: "Gagal menyimpan data", error })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params
    const payload = await request.validate(UpdateUserValidator)
    try {
      const perngguna = await User.findOrFail(id)
      const data = await perngguna.merge(payload).save()
      if (JSON.stringify(payload) === '{}') {
        console.log("data update function kosong");
        return response.badRequest({ message: "Data tidak boleh kosong" })
      }

      response.ok({ message: "Berhasil mengubah data", data })
    } catch (error) {
      console.log(error);
      response.badRequest({ message: "Gagal mengubah data", error: error.message })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params
    try {
      const user = await User.findOrFail(id)
      await user.delete()

      response.ok({ message: "Berhasil mengahapus data" })
    } catch (error) {
      response.badRequest({ message: "Gagal menghapus data", error: error.message })
    }
  }
}
