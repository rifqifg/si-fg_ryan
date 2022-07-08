import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Activity from 'App/Models/Activity'
import Presence from 'App/Models/Presence'
import CreatePresenceValidator from 'App/Validators/CreatePresenceValidator'
import UpdatePresenceValidator from 'App/Validators/UpdatePresenceValidator'
import { DateTime } from 'luxon'
export default class PresencesController {
  public async index({ request, response }: HttpContextContract) {
    const hariIni = DateTime.now().toSQLDate().toString()
    const { page = 1, limit = 10, keyword = "", activityId = "", orderBy = "", orderDirection = 'ASC', fromDate = hariIni, toDate = hariIni } = request.qs()
    //TODO: bikin raw query & select secukupnya biar bisa order by join column

    const activity = await Activity.findOrFail(activityId)
    const presence = await Presence.query()
      .preload('employee', query => {
        query.select('name', 'id', 'nip')
      })
      .where('activity_id', activityId)
      .andWhere(query => {
        query.orWhereHas('employee', query => {
          query.whereILike('name', `%${keyword}%`)
        })
      })
      .whereBetween('time_in', [fromDate, toDate])
      .paginate(page, limit)

    response.ok({ message: "Data Berhasil Didapatkan", data: { activity, presence } })
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreatePresenceValidator)

    try {
      const data = await Presence.create(payload)
      response.created({ message: "Create data success", data })
    } catch (error) {
      console.log(error);
      response.badRequest({ ...error })
    }
  }

  public async scanRFID({ request, response }: HttpContextContract) {
    // const { activityId, rfid } = request.body()
    // TODO: check apakah dia sudah scan_in atau belum
    // const checkPresence = await Presence.query()
    //   .preload('employee')
    //   .whereHas('employee', query => {
    //     query.where('rfid', rfid)
    //   })
    //   .where('activity_id', activityId)
    //   .andWhere(query => {
    //     query.whereRaw(`left(time_in,10)=current_date`)
    //     query.orWhereRaw(`left(time_out,10)=current_date`)
    //   })

    // response.ok({ message: "Get data success", checkPresence })
    response.ok({ message: "Lanjut Malem" })
  }

  public async show({ }: HttpContextContract) { }

  public async edit({ }: HttpContextContract) { }

  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params
    const payload = await request.validate(UpdatePresenceValidator)
    try {
      const findData = await Presence.findOrFail(id)
      const data = await findData.merge(payload).save()
      response.ok({ message: "Update data success", data })
    } catch (error) {
      console.log(error);
      response.badGateway({ ...error })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params
    try {
      const data = await Presence.findOrFail(id)
      await data.delete()

      response.ok({ message: "Delete data success" })
    } catch (error) {
      console.log(error);
      response.internalServerError(error)
    }
  }
}
