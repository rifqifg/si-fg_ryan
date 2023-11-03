import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Raport from '../../Models/Raport'
import CreateRaportValidator from '../../Validators/CreateRaportValidator'

export default class RaportsController {
  public async index({ response }: HttpContextContract) {
    try {
      const data = await Raport.query()

      response.ok({message: 'Berhasil mengambil data', data})
    } catch (error) {
      response.badRequest({message: "Gagal mengambil data", error: error.message || error})
    }

  }


  public async store({request, response}: HttpContextContract) {
    const payload = await request.validate(CreateRaportValidator)

    try {
      const data = await Raport.create(payload)


      response.created({message: 'Berhasil membuat data', data})
    } catch (error) {
      response.badRequest({message: 'Gagal mengambil data', error})
    }
  }

  public async show({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
