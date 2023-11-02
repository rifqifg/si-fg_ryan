import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AssetStatus from 'Inventory/Models/AssetStatus'
import Database from '@ioc:Adonis/Lucid/Database'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'
import { DateTime } from 'luxon'

export default class AssetStatusesController {
  public async index({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
   CreateRouteHist(statusRoutes.START, dateStart)
    const { page = 1, limit = 10, keyword = "", mode = "page" } = request.qs()

    try {
      let data = {}
      if (mode === "page") {
        data = await AssetStatus
          .query()
          .whereILike('id', `%${keyword}%`)
          .orderBy('id')
          .paginate(page, limit)
      } else if (mode === "list") {
        data = await AssetStatus
          .query()
          .withCount('assets')
          .whereILike('id', `%${keyword}%`)
          .orderBy('id')
      } else {
        return response.badRequest({ message: "Mode tidak dikenali, (pilih: page / list)" })
      }

      const allAssetsCount = await Database.from('inventory.assets').count('id as total').first()
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", total_asset: allAssetsCount.total, data })
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      response.badRequest({ message: "Gagal mengambil data", error: error.message })
    }
  }

  public async create({ }: HttpContextContract) { }

  public async store({ }: HttpContextContract) { }

  public async show({ }: HttpContextContract) { }

  public async edit({ }: HttpContextContract) { }

  public async update({ }: HttpContextContract) { }

  public async destroy({ }: HttpContextContract) { }
}
