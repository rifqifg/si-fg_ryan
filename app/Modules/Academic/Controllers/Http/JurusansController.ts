import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Jurusan from '../../Models/Jurusan'

export default class JurusansController {
  public async index({response}: HttpContextContract) {
    try {
      const data = await Jurusan.query()

      response.ok({message: 'Berhasil mengambil data', data})
    } catch (error) {
      response.badRequest({message: 'Gagal mengammbil data'})
    }
  }

  public async create({}: HttpContextContract) {}

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
