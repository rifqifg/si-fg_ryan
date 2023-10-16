import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Semester from '../../Models/Semester'

export default class SemestersController {
  public async index({request, response}: HttpContextContract) {
    const {isActive = ""} =  request.qs()

    const active = isActive === "true" ? true : false
    
    try {
      const data = await Semester.query().select('*').if(isActive, q => q.where('is_active', active))


      response.ok({message: 'Berhasil mengambil data', data})
    } catch (error) {
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
