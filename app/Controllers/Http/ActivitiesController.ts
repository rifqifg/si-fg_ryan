import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import { checkRoleSuperAdmin } from 'App/Helpers/checkRoleSuperAdmin';
import { RolesHelper } from 'App/Helpers/rolesHelper';
import { unitHelper } from 'App/Helpers/unitHelper';
import Activity from 'App/Models/Activity';
import ActivityMember from 'App/Models/ActivityMember';
import EmployeeUnit from 'App/Models/EmployeeUnit';
import Presence from 'App/Models/Presence';
import SubActivity from 'App/Models/SubActivity';
import User from 'App/Models/User';
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist';
import { statusRoutes } from 'App/Modules/Log/lib/enum';
import CreateActivityValidator from 'App/Validators/CreateActivityValidator'
import UpdateActivityValidator from 'App/Validators/UpdateActivityValidator';
import { DateTime } from 'luxon';
import { validate as uuidValidation } from "uuid";

export default class ActivitiesController {
  public async index({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { page = 1, limit = 10, keyword = "", orderBy = "name", orderDirection = 'ASC' } = request.qs()

    const user = await User.query()
      .preload('employee', e => e
        .select('id', 'name', 'foundation_id'))
      .preload('roles', r => r
        .preload('role'))
      .where('employee_id', auth.user!.$attributes.employeeId)
      .first()
    const userObject = JSON.parse(JSON.stringify(user))

    const unitLeadIds = await unitHelper("lead")
    // const superAdmin = await checkRoleSuperAdmin()

    const roles = await RolesHelper(userObject)
    const isAdminHrd = roles.includes('admin_hrd')

    try {
      let data: object
      if (roles.includes('super_admin')) {
        data = await Activity.query()
          .preload('unit', unit => unit.select('id', 'name'))
          .preload('categoryActivity', categoryActivity => categoryActivity.select('id', 'name'))
          .preload('unit', u => u.select('name'))
          .whereILike('name', `%${keyword}%`)
          .orderBy(orderBy, orderDirection)
          .paginate(page, limit)
      } else {
        data = await Activity.query()
          .preload('unit', unit => unit.select('id', 'name'))
          .preload('categoryActivity', categoryActivity => categoryActivity.select('id', 'name'))
          .preload('unit', u => u.select('name'))
          .whereILike('name', `%${keyword}%`)
          // .andWhere(query => {
          //   // query.where('division_id', auth.use('api').user!.divisionId)
          //   query.whereHas('activityMembers', am => (am.where('employee_id', user.employeeId), am.where('role', 'manager')))
          //   .if(isAdminHrd, query => {
          //     query.orWhereHas('unit', u => u
          //       .whereIn('id', unitLeadIds)
          //       .andWhere(query => query.whereHas('employeeUnits', eu => eu.where('title', 'lead'))))
          //   })
          // })
          // .andWhereIn('unit_id', unitLeadIds)
          .if(!roles.includes('admin_foundation'), query => {
            query.whereHas('activityMembers', am => {
              am.where('employee_id', user!.employeeId)
                .andWhere('role', 'manager')
            })
          })
          .if((isAdminHrd), q => q.orWhereIn('unit_id', unitLeadIds))
          .if(roles.includes('admin_foundation'), query => {
            query.whereHas('unit', u => u.where('foundation_id', user!.employee.foundationId))
          })
          .orderBy(orderBy, orderDirection)
          .paginate(page, limit)
      }

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Data Berhasil Didapatkan", data })
    } catch (error) {
      const message = "HRDAC-index: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Activity ID tidak valid" });
    }

    try {
      const data = await Activity.query()
        .where("id", id)
        .preload('unit', unit => unit.select('id', 'name'))
        .preload('categoryActivity', categoryActivity => categoryActivity.select('id', 'name'))
        .preload('activityMembers', activityMembers => activityMembers.select('id', 'role', 'employee_id').preload('employee', employee => employee.select('name')))
        .firstOrFail();

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "HRDAC-SHOW: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async getActivity({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { keyword = "", orderBy = "name", orderDirection = 'ASC', activity_type = '' } = request.qs()

    const user = await User.query()
      .preload('employee', e => e
        .select('id', 'name', 'foundation_id'))
      .preload('roles', r => r
        .preload('role'))
      .where('employee_id', auth.user!.$attributes.employeeId)
      .first()
    const userObject = JSON.parse(JSON.stringify(user))
    const roles = await RolesHelper(userObject)
    let data: object
    const unitIds = await unitHelper()

    try {
      if (userObject.roles[0].role_name == 'super_admin') {

        data = await Activity.query()
          .preload('unit', unit => unit.select('id', 'name'))
          .preload('categoryActivity', categoryActivity => categoryActivity.select('id', 'name'))
          .where(query => {
            if (activity_type !== '') {
              query.where('activity_type', activity_type);
              query.andWhereILike('name', `%${keyword}%`);
            }
            query.andWhereILike('name', `%${keyword}%`);
          })
          // .andWhere('owner', auth.user!.id) // Jika perlu, aktifkan kembali ini
          .orderBy(orderBy, orderDirection)
      } else {
        console.log('masuk sini ya');

        data = await Activity.query()
          .preload('unit', unit => unit.select('id', 'name'))
          .preload('categoryActivity', categoryActivity => categoryActivity.select('id', 'name'))
          .where(query => {
            if (activity_type !== '') {
              query.where('activity_type', activity_type);
              query.andWhereILike('name', `%${keyword}%`);
            }
            query.andWhereILike('name', `%${keyword}%`);
          })
          .if(!roles.includes('super_admin') && !roles.includes('admin_foundation'), query => {
            query.whereIn('unit_id', unitIds)
          })
          .if(roles.includes('admin_foundation'), query => {
            query.whereHas('unit', u => u.where('foundation_id', user!.employee.foundationId))
          })
          // .andWhere('owner', auth.user!.id) // Jika perlu, aktifkan kembali ini
          .orderBy(orderBy, orderDirection)
      }
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Data Berhasil Didapatkan", data })
    } catch (error) {
      const message = "HRDAC-GETACTIVITY: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async store({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
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
        // TOD0: Cek
        unitId: payload.unitId,
        // division_id: payload.division_id || auth.use('api').user!.divisionId,
        assessment: payload.assessment,
        default: payload.default,
        activityType: payload.activityType,
        categoryActivityId: payload.categoryActivityId
      }
      const data = await Activity.create(formattedPayload)

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.created({
        message: "Create data success", data
      })
    } catch (error) {
      const message = "HRDAC-STORE: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async update({ request, response, params, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
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
      formattedPayload['unitId'] = payload.unitId
      // formattedPayload['division_id'] = payload.division_id
      formattedPayload['categoryActivityId'] = payload.categoryActivityId
      payload.assessment ? formattedPayload['assessment'] = payload.assessment : ""
      payload.activityType ? formattedPayload['activityType'] = payload.activityType : ""
      payload.default ? formattedPayload['default'] = payload.default : formattedPayload['default'] = 0
      payload.activityType ? formattedPayload['activityType'] = payload.activityType : ""
      payload.categoryActivityId ? formattedPayload['categoryActivityId'] = payload.categoryActivityId : ""

      const findData = await Activity.findOrFail(id)

      // cek lead unit
      const superAdmin = await checkRoleSuperAdmin()
      if (!superAdmin) {
        const unitLead = await EmployeeUnit.query()
          .where('employee_id', auth.user!.$attributes.employeeId)
          .andWhere('title', 'lead')
          .first()
        if (unitLead?.unitId !== findData.unitId) {
          return response.badRequest({ message: "Gagal update status izin dikarenakan anda bukan ketua unit tersebut" });
        }
      }

      const data = await findData.merge(formattedPayload).save()

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.created({
        message: "Update data success", data
      })
    } catch (error) {
      const message = "HRDAC-UPDATE: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }


  public async destroy({ params, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { id } = params
    try {
      const data = await Activity.findOrFail(id)

      // cek lead unit
      const superAdmin = await checkRoleSuperAdmin()
      if (!superAdmin) {
        const unitLead = await EmployeeUnit.query()
          .where('employee_id', auth.user!.$attributes.employeeId)
          .andWhere('title', 'lead')
          .first()
        if (unitLead?.unitId !== data.unitId) {
          return response.badRequest({ message: "Gagal update status izin dikarenakan anda bukan ketua unit tersebut" });
        }
      }

      await data.delete()

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Delete data success" })
    } catch (error) {
      const message = "HRDAC-DELETE: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({ message: "Tidak dapat menghapus aktivitas yang sudah memiliki presensi", error: error.message || error })
    }
  }
}
