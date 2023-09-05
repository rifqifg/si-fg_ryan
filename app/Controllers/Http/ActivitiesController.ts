import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import Activity from 'App/Models/Activity';
import ActivityMember from 'App/Models/ActivityMember';
import Presence from 'App/Models/Presence';
import SubActivity from 'App/Models/SubActivity';
import User from 'App/Models/User';
import CreateActivityValidator from 'App/Validators/CreateActivityValidator'
import UpdateActivityValidator from 'App/Validators/UpdateActivityValidator';
import { DateTime } from 'luxon';
import { validate as uuidValidation } from "uuid";

export default class ActivitiesController {
  public async index({ request, response, auth }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", orderBy = "name", orderDirection = 'ASC' } = request.qs()

    const user = await User.query().preload('roles', r => r.preload('role')).where('id', auth.use('api').user!.id).firstOrFail()
    const userObject = JSON.parse(JSON.stringify(user))

    let data: object
    if (userObject.roles[0].role_name == 'super_admin') {
      data = await Activity.query()
        .preload('division', division => division.select('id', 'name'))
        .preload('categoryActivity', categoryActivity => categoryActivity.select('id', 'name'))
        .preload('activityMembers', activityMembers => activityMembers.select('id', 'role', 'employee_id').preload('employee', employee => employee.select('name')))
        .whereILike('name', `%${keyword}%`)
        .orderBy(orderBy, orderDirection)
        .paginate(page, limit)
    } else {
      data = await Activity.query()
        .preload('division', division => division.select('id', 'name'))
        .preload('categoryActivity', categoryActivity => categoryActivity.select('id', 'name'))
        .preload('activityMembers', activityMembers => activityMembers.select('id', 'role', 'employee_id').preload('employee', employee => employee.select('name')))
        .whereILike('name', `%${keyword}%`)
        .andWhere('division_id', auth.use('api').user!.divisionId)
        .orderBy(orderBy, orderDirection)
        .paginate(page, limit)
    }

    response.ok({ message: "Data Berhasil Didapatkan", data })
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Activity ID tidak valid" });
    }

    try {
      const data = await Activity.query()
        .where("id", id)
        .preload('division', division => division.select('id', 'name'))
        .preload('categoryActivity', categoryActivity => categoryActivity.select('id', 'name'))
        .preload('activityMembers', activityMembers => activityMembers.select('id', 'role', 'employee_id').preload('employee', employee => employee.select('name')))
        .firstOrFail();
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "HRDAC-SHOW: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async getActivity({ request, response, auth }: HttpContextContract) {
    const { keyword = "", orderBy = "name", orderDirection = 'ASC' } = request.qs()

    const user = await User.query().preload('roles', r => r.preload('role')).where('id', auth.use('api').user!.id).firstOrFail()
    const userObject = JSON.parse(JSON.stringify(user))
    let data: object

    if (userObject.roles[0].role_name == 'super_admin') {
      console.log('masuk sinikah?');

      data = await Activity.query()
        .preload('division', division => division.select('id', 'name'))
        .preload('categoryActivity', categoryActivity => categoryActivity.select('id', 'name'))
        .whereILike('name', `%${keyword}%`)
        .orderBy(orderBy, orderDirection)
    } else {
      console.log('masuk sini ya');

      data = await Activity.query()
        .preload('division', division => division.select('id', 'name'))
        .preload('categoryActivity', categoryActivity => categoryActivity.select('id', 'name'))
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
        timeInStart: payload.timeInStart?.toFormat('HH:mm:ss'),
        timeLateStart: payload.timeLateStart?.toFormat('HH:mm:ss'),
        timeInEnd: payload.timeInEnd?.toFormat('HH:mm:ss'),
        timeOutStart: payload.timeOutStart?.toFormat('HH:mm:ss'),
        timeOutEnd: payload.timeOutEnd?.toFormat('HH:mm:ss'),
        timeOutDefault: payload.timeOutDefault?.toFormat('HH:mm:ss'),
        maxWorkingDuration: payload.maxWorkingDuration?.toFormat('HH:mm:ss'),
        type: payload.type,
        scheduleActive: payload.scheduleActive,
        days: payload.days,
        owner: auth.user!.id,
        division_id: payload.division_id || auth.use('api').user!.divisionId,
        assessment: payload.assessment,
        default: payload.default,
        activityType: payload.activityType,
        categoryActivityId: payload.categoryActivityId
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

    // jika data yg di update ada activityType nya, maka perlu pengecekan
    if (payload.activityType == "fixed_time") {
      const cekSubActivity = await SubActivity.query().where('activity_id', id).first()
      const cekMemberActivity = await ActivityMember.query().where('activity_id', id).first()
      if (cekSubActivity || cekMemberActivity) {
        return response.badRequest({ message: "Update data gagal, silahkan kosongkan data detailnya terlebih dahulu" })
      }
    } else if (payload.activityType == "not_fixed_time") {
      const cek = await Presence.query().where('activity_id', id).first()
      if (cek) {
        return response.badRequest({ message: "Update data gagal, silahkan kosongkan data detailnya terlebih dahulu" })
      }
    }

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
      payload.timeInStart ? formattedPayload['timeInStart'] = payload.timeInStart!.toFormat('HH:mm:ss') : payload.timeInStart == null ? formattedPayload['timeInStart'] = payload.timeInStart : ''
      payload.timeLateStart ? formattedPayload['timeLateStart'] = payload.timeLateStart!.toFormat('HH:mm:ss') : payload.timeLateStart == null ? formattedPayload['timeLateStart'] = payload.timeLateStart : ''
      payload.timeInEnd ? formattedPayload['timeInEnd'] = payload.timeInEnd!.toFormat('HH:mm:ss') : payload.timeInEnd == null ? formattedPayload['timeInEnd'] = payload.timeInEnd : ''
      payload.timeOutStart ? formattedPayload['timeOutStart'] = payload.timeOutStart!.toFormat('HH:mm:ss') : payload.timeOutStart == null ? formattedPayload['timeOutStart'] = payload.timeOutStart : ''
      payload.timeOutEnd ? formattedPayload['timeOutEnd'] = payload.timeOutEnd!.toFormat('HH:mm:ss') : payload.timeOutEnd == null ? formattedPayload['timeOutEnd'] = payload.timeOutEnd : ''
      payload.timeOutDefault ? formattedPayload['timeOutDefault'] = payload.timeOutDefault!.toFormat('HH:mm:ss') : payload.timeOutDefault == null ? formattedPayload['timeOutDefault'] = payload.timeOutDefault : ''
      payload.maxWorkingDuration ? formattedPayload['maxWorkingDuration'] = payload.maxWorkingDuration?.toFormat('HH:mm:00') : payload.maxWorkingDuration == null ? formattedPayload['maxWorkingDuration'] = payload.maxWorkingDuration : ''
      payload.type ? formattedPayload['type'] = payload.type : ''
      payload.scheduleActive ? formattedPayload['scheduleActive'] = payload.scheduleActive : ''
      payload.days ? formattedPayload['days'] = payload.days : ""
      formattedPayload['division_id'] = payload.division_id
      formattedPayload['categoryActivityId'] = payload.categoryActivityId
      payload.assessment ? formattedPayload['assessment'] = payload.assessment : ""
      payload.activityType ? formattedPayload['activityType'] = payload.activityType : ""

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
