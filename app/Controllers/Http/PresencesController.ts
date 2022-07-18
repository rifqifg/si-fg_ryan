import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Activity from 'App/Models/Activity'
import Employee from 'App/Models/Employee'
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

    response.ok({
      message: "Data Berhasil Didapatkan", data: {
        activity, presence, recap: {
          overview: {
            totalLate: '00:17:52',
            averagePresentPerDay: '90%',
            mostPresentEmployee: {
              totalPresent: 22,
              fastestPresent: '06:00:01',
              empmloyee: {
                id: '1239081723987123',
                name: 'Fulan bin Fulan'
              }
            }
          },
          detail: [
            { id: '2312939301', name: 'Fulan bin Fulan', totalPresent: 22, fastestPresent: '06:00:01', totalLate: '00:00:00' },
            { id: '2312939301', name: 'Fulan bin Fulan', totalPresent: 22, fastestPresent: '06:00:01', totalLate: '00:00:00' },
            { id: '2312939301', name: 'Fulan bin Fulan', totalPresent: 22, fastestPresent: '06:00:01', totalLate: '00:00:00' },
            { id: '2312939301', name: 'Fulan bin Fulan', totalPresent: 22, fastestPresent: '06:00:01', totalLate: '00:00:00' },
            { id: '2312939301', name: 'Fulan bin Fulan', totalPresent: 22, fastestPresent: '06:00:01', totalLate: '00:00:00' },
            { id: '2312939301', name: 'Fulan bin Fulan', totalPresent: 22, fastestPresent: '06:00:01', totalLate: '00:00:00' },
            { id: '2312939301', name: 'Fulan bin Fulan', totalPresent: 22, fastestPresent: '06:00:01', totalLate: '00:00:00' },
          ]
        }
      }
    })
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
    const { activityId, rfid } = request.body()
    const employeeId = (await Employee.findByOrFail('rfid', rfid)).id
    const activity = await Activity.findOrFail(activityId)
    const prezence = await Presence
      .query()
      .select()
      .preload('employee')
      .whereRaw(`timezone('Asia/Jakarta', now())::date - time_in::date =0`)
      .andWhereHas('employee', query => {
        query.where('rfid', rfid)
      })
      .andWhere('activityId', activityId)
      .first()
    // .orderBy('created_at', 'desc')

    // const prezence = await Presence.query()
    //   .preload('employee', query => {
    //     query.select('name', 'id', 'nip', 'rfid')
    //   })
    //   .whereRaw(`timezone('Asia/Jakarta', now())::date - time_in::date=0`)
    //   .andWhereHas('employee', query => { query.where('rfid', rfid) })
    //   .orderBy('updated_at', 'desc')

    // const prezence = await Database.rawQuery(`select p.id
    // ,timezone('Asia/Jakarta', now())::date - time_in::date diff2, name
    // ,time_in::date
    // ,timezone('Asia/Jakarta', now())::date
    //   from presences p
    //   left join employees e 
    //   on e.id = p.employee_id 
    //   where rfid = '123'
    //   order by p.created_at desc`)
    // console.log(prezence);

    // return response.ok(prezence)
    if (prezence === null) { //belum ada data = belum pernah masuk
      const scanIn = await Presence.create({ activityId, employeeId, timeIn: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss') })
      response.ok({ message: "Scan In Success", activity, scanIn })
    } else if (prezence!.timeOut === null) { //sudah ada data & belum keluar
      // console.log(prezence);
      // const scanOut = await Presence
      //   .query()
      //   .preload('employee')
      //   .whereRaw(`timezone('Asia/Jakarta', now())::date - time_in::date =0`)
      //   .andWhereHas('employee', query => {
      //     query.where('rfid', rfid)
      //   })
      //   .andWhere('activityId', activityId)
      //   .update({ timeOut: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss') })
      const scanOut = await prezence!
        .merge({ timeOut: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss') })
        .save()
      response.ok({ message: "Scan Out Success", data: scanOut })
    } else {
      response.badRequest({ message: "Anda sudah melakukan scan in & scan out!" })
    }


    // TODO: check apakah dia sudah scan_in atau belum
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params
    const activity = await Activity.findOrFail(id)

    const presence = await Presence.query()
      .preload('employee', query => {
        query.select('name', 'id', 'nip')
      })
      .whereRaw(`timezone('Asia/Jakarta', now())::date - time_in::date=0`)
      .andWhere('activity_id', id)
      .orderBy('updated_at', 'desc')
    response.ok({ message: "Get data success", data: { activity, presence } })

    //     const kehadiran = await Database.rawQuery(`
    // select id, time_in, cast(time_in as date) dateIn, current_date()
    // ,timezone('Asia/Jakarta', now())::date - time_in::date diff 
    // from presences
    // where id='fd9ebaa9-be87-482b-9ca2-990430925352'
    // order by created_at desc`)
    // const kehadiran = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss');
    // response.ok({ message: "Get data success", data: { kehadiran, activity, presence } })
  }

  public async edit({ params, response }: HttpContextContract) {
    const { id } = params
    try {
      const data = await Presence.query().preload('employee', query => query.select('name')).where('id', id).firstOrFail()
      response.ok({ message: "Get data success", data })
    } catch (error) {
      response.badRequest(error)
    }
  }

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
