import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'

export default class ImportInventoriesController {
  public async getTemplateAsset({ response, request }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const data = ['']
    CreateRouteHist(request, statusRoutes.FINISH)
    response.ok({ message: "Berhasil mengambil data", data })
  }
}
