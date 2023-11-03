import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'
import { DateTime } from 'luxon'

export default class ImportInventoriesController {
  public async getTemplateAsset({ response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
   CreateRouteHist(statusRoutes.START, dateStart)
    const data = ['']
    CreateRouteHist(statusRoutes.FINISH, dateStart)
    response.ok({ message: "Berhasil mengambil data", data })
  }
}
