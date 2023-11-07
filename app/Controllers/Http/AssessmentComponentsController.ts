import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AssessmentComponent from 'App/Models/AssessmentComponent'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'
import { DateTime } from 'luxon'

export default class AssessmentComponentsController {
  public async index({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { keyword = "" } = request.qs()

    let data = {}

    try {
      data = await AssessmentComponent.query()
        .whereILike('name', `%${keyword}%`)
        .orderBy('name')

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      const message = "HRDAC01: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  //TODO: CRUD
}
