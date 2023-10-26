import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Semester from '../../Models/Semester'
import { statusRoutes } from 'App/Modules/Log/lib/enum'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'

export default class SemestersController {
  public async index({request, response}: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const {isActive = ""} =  request.qs()

    const active = isActive === "true" ? true : false
    
    try {
      const data = await Semester.query().select('*').if(isActive, q => q.where('is_active', active))

      CreateRouteHist(request, statusRoutes.FINISH)
      response.ok({message: 'Berhasil mengambil data', data})
    } catch (error) {
      CreateRouteHist(request, statusRoutes.ERROR, error.message || error)
      response.badRequest({message: 'Gagal mengambil data', error})
    }
  }

  public async create({}: HttpContextContract) {}

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
