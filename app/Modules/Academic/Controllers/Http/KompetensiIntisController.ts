import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import KompetensiInti from '../../Models/KompetensiInti'
import { statusRoutes } from 'App/Modules/Log/lib/enum';
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist';
import { DateTime } from 'luxon';

export default class KompetensiIntisController {
  public async index({ response}: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart);
    try {
      const data = await KompetensiInti.query().select('*')

      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({message: 'Berhasil mengambil data', data})
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error);
      response.badRequest({message: 'Gagal mengambil data', error: error.message})
    }
  }

  public async store({request, response}: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart);
    const payload = await request.validate({schema: schema.create({
      nama: schema.string([rules.trim()])
    })})
    try {

      const data = await KompetensiInti.create(payload)

      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({message: 'Berhasil menyimpan data', data})
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error);
      response.badRequest({message: 'Gagal mengambil data', error: error.message})
    }
  }

  public async show({ response, params}: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart);
    const {id} = params

    try {
      const data = await KompetensiInti.query().where('id', '=', id).firstOrFail()

      if(!data) return response.badRequest({message: 'Kompetensi Inti tidak ditemukan'})

      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({message: 'Berhasil mengambil data', data})
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error);
      response.badRequest({message: 'Gagal mengambil data', error: error.message})
    }
  }

  public async update({request, response, params}: HttpContextContract) {
    const {id} = params

    const payload = await request.validate({schema: schema.create({
      nama: schema.string([rules.trim()])
    })})
    try {

      if (JSON.stringify(payload) === '{}') {
        console.log("data update kosong");
        return response.badRequest({ message: "Data tidak boleh kosong" })
      }
      const kompetensiInti = await KompetensiInti.findByOrFail('id', id)
      const data = await kompetensiInti.merge(payload).save()

      response.ok({message: 'Berhasil memperbarui data', data})

    } catch (error) {
      response.badRequest({message: 'Gagal memperbarui data', error: error.message})
    }
  }

  public async destroy({response, params}: HttpContextContract) {
    const {id} = params

    try {
      const data = await KompetensiInti.findByOrFail('id', id)
      await data.delete()

      response.ok({message: 'Berhasil menghapus data'})
    } catch (error) {
      response.badRequest({message: 'Gagal menghapus data'})
    }
  }
}
