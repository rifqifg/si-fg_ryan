import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ManufacturersController {
  public async index({ response }: HttpContextContract) {
    response.ok("hhe")
  }

  public async create({ }: HttpContextContract) { }

  public async store({ }: HttpContextContract) {

  }

  public async show({ }: HttpContextContract) { }

  public async edit({ }: HttpContextContract) { }

  public async update({ }: HttpContextContract) { }

  public async destroy({ }: HttpContextContract) { }
}
