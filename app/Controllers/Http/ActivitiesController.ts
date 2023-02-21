import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import Activity from 'App/Models/Activity';
import CreateActivityValidator from 'App/Validators/CreateActivityValidator'
import UpdateActivityValidator from 'App/Validators/UpdateActivityValidator';
import { DateTime } from 'luxon';

export default class ActivitiesController {
  public async index({ request, response, auth }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", orderBy = "name", orderDirection = 'ASC' } = request.qs()

    let data: object
    if (auth.user!.role == 'super_admin') {
      data = await Activity.query()
        .whereILike('name', `%${keyword}%`)
        .orderBy(orderBy, orderDirection)
        .paginate(page, limit)

    } else {
      data = await Activity.query()
        .whereILike('name', `%${keyword}%`)
        .andWhere('owner', auth.user!.id)
        .orderBy(orderBy, orderDirection)
        .paginate(page, limit)
    }

    response.ok({ message: "Data Berhasil Didapatkan", data })
  }

  public async getActivity({ request, response, auth }: HttpContextContract) {
    const { keyword = "", orderBy = "name", orderDirection = 'ASC' } = request.qs()
    let data: object

    if (auth.user!.role == 'super_admin') {
      data = await Activity.query()
        .whereILike('name', `%${keyword}%`)
        .orderBy(orderBy, orderDirection)
    } else {
      data = await Activity.query()
        .whereILike('name', `%${keyword}%`)
        .andWhere('owner', auth.user!.id)
        .orderBy(orderBy, orderDirection)

    }
    response.ok({ message: "Data Berhasil Didapatkan", data })
  }

  public async store({ request, response, auth }: HttpContextContract) {
    const payload = await request.validate(CreateActivityValidator)

    try {
      const formattedPayload = {
        name: payload.name,
        description: payload.description,
        timeInStart: payload.timeInStart.toFormat('HH:mm'),
        timeLateStart: payload.timeLateStart.toFormat('HH:mm'),
        timeInEnd: payload.timeInEnd.toFormat('HH:mm'),
        timeOutStart: payload.timeOutStart.toFormat('HH:mm'),
        timeOutEnd: payload.timeOutEnd.toFormat('HH:mm'),
        maxWorkingDuration: payload.maxWorkingDuration?.toFormat('HH:mm'),
        type: payload.type,
        scheduleActive: payload.scheduleActive,
        days: payload.days,
        owner: auth.user!.id
      }
      const data = await Activity.create(formattedPayload)

      response.created({
        message: "Create data success", data
      })
    } catch (error) {
      console.log(error);
      response.badRequest(error)
    }
  }

  public async update({ request, response, params }: HttpContextContract) {
    const { id } = params
    const payload = await request.validate(UpdateActivityValidator)

    // validasi waktu agar tidak tabrakan dengan waktu pada activity dengan schedule aktif
    if (payload.type == 'scheduled') {

      const payloadDay = payload.days?.split('')

      let queryGetDataHaveDay = `
    SELECT *
    FROM activities a
    WHERE a.id <> '${id}'
      AND schedule_active = true
      AND
      (`
      payloadDay?.forEach(day => {
        queryGetDataHaveDay += `days like '%${day}%'`
        queryGetDataHaveDay += ' OR '
      })
      queryGetDataHaveDay = queryGetDataHaveDay!.slice(0, -3)
      queryGetDataHaveDay += ')'

      const { rows: dataHariSama } = await Database.rawQuery(queryGetDataHaveDay)
      // response.ok(dataHariSama)
      dataHariSama.forEach(data => {
        const dataTimeInEnd = DateTime.fromFormat(data.time_in_end, 'HH:mm:ss')
        const dataTimeInStart = DateTime.fromFormat(data.time_in_start, 'HH:mm:ss')
        const dataTimeOutEnd = DateTime.fromFormat(data.time_out_end, 'HH:mm:ss')
        const dataTimeOutStart = DateTime.fromFormat(data.time_out_start, 'HH:mm:ss')


        //is time_in_start   INSIDE  old time_in ???
        const hitungWaktuMasuk = dataTimeInEnd.diff(payload.timeInStart!, ["minutes"])
        const hitungWaktuMasuk2 = dataTimeInStart.diff(payload.timeInStart!, ["minutes"])
        if (hitungWaktuMasuk.minutes >= 0 && hitungWaktuMasuk2.minutes <= 0) {
          return response.badRequest({
            message: `Waktu AWAL presensi kegiatan ini bertentangan dengan waktu MASUK kegiatan ${data.name}`
          })
        }

        // is time_in_end   INSIDE old time_in ???
        const hitungWaktuMasukAkhir = dataTimeInEnd.diff(payload.timeInEnd!, ["minutes"])
        const hitungWaktuMasukAkhir2 = dataTimeInStart.diff(payload.timeInEnd!, ["minutes"])
        if (hitungWaktuMasukAkhir.minutes >= 0 && hitungWaktuMasukAkhir2.minutes <= 0) {
          return response.badRequest({
            message: `Waktu AKHIR presensi MASUK kegiatan ini bertentangan dengan waktu MASUK kegiatan ${data.name}`
          })
        }

        //is time_out_start  INSIDE old time_out ???
        const hitungWaktuKeluarAwal = dataTimeOutEnd.diff(payload.timeOutStart!, ["minutes"])
        const hitungWaktuKeluarAkhir = dataTimeOutStart.diff(payload.timeOutStart!, ["minutes"])
        if (hitungWaktuKeluarAwal.minutes >= 0 && hitungWaktuKeluarAkhir.minutes <= 0) {
          return response.badRequest({
            message: `Waktu AWAL presensi PULANG kegiatan ini bertentangan dengan waktu PULANG kegiatan ${data.name}`
          })
        }

        //is time_out_end  INSIDE old time_out ???
        const hitungWaktuKeluarAwal2 = dataTimeOutEnd.diff(payload.timeOutEnd!, ["minutes"])
        const hitungWaktuKeluarAkhir2 = dataTimeOutStart.diff(payload.timeOutEnd!, ["minutes"])
        if (hitungWaktuKeluarAwal2.minutes >= 0 && hitungWaktuKeluarAkhir2.minutes <= 0) {
          return response.badRequest({
            message: `Waktu AKHIR presensi PULANG kegiatan ini bertentangan dengan waktu PULANG kegiatan ${data.name}`
          })
        }

        // console.log(hitungWaktuKeluarAwal2.toObject(), hitungWaktuKeluarAkhir2.toObject(), dataTimeInStart.toISOTime(), payload.timeOutStart?.toISOTime());
      });
    }

    // response.ok("sip okeh")
    // return false
    try {
      let formattedPayload = {}

      payload.name ? formattedPayload['name'] = payload.name : ''
      payload.description ? formattedPayload['description'] = payload.description : ''
      payload.timeInStart ? formattedPayload['timeInStart'] = payload.timeInStart!.toFormat('HH:mm') : ''
      payload.timeLateStart ? formattedPayload['timeLateStart'] = payload.timeLateStart!.toFormat('HH:mm') : ''
      payload.timeInEnd ? formattedPayload['timeInEnd'] = payload.timeInEnd!.toFormat('HH:mm') : ''
      payload.timeOutStart ? formattedPayload['timeOutStart'] = payload.timeOutStart!.toFormat('HH:mm') : ''
      payload.timeOutEnd ? formattedPayload['timeOutEnd'] = payload.timeOutEnd!.toFormat('HH:mm') : ''
      payload.maxWorkingDuration ? formattedPayload['maxWorkingDuration'] = payload.maxWorkingDuration?.toFormat('HH:mm:00') : ''
      payload.type ? formattedPayload['type'] = payload.type : ''
      payload.scheduleActive ? formattedPayload['scheduleActive'] = payload.scheduleActive : ''
      payload.days ? formattedPayload['days'] = payload.days : ""

      const findData = await Activity.findOrFail(id)
      const data = await findData.merge(formattedPayload).save()

      response.created({
        message: "Update data success", data
      })
    } catch (error) {
      console.log(error);
      response.badRequest(error)
    }
  }


  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params
    try {
      const data = await Activity.findOrFail(id)
      await data.delete()

      response.ok({ message: "Delete data success" })
    } catch (error) {
      console.log(error);
      response.badRequest({ message: "Tidak dapat menghapus aktivitas yang sudah memiliki presensi", error: error.message || error })
    }
  }
}
