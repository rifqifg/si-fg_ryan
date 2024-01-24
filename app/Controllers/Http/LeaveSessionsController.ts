import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { checkRoleSuperAdmin } from 'App/Helpers/checkRoleSuperAdmin'
import { RolesHelper } from 'App/Helpers/rolesHelper'
import { unitHelper } from 'App/Helpers/unitHelper'
import LeaveSession from 'App/Models/LeaveSession'
import User from 'App/Models/User'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'
import CreateLeaveSessionValidator from 'App/Validators/CreateLeaveSessionValidator'
import UpdateLeaveSessionValidator from 'App/Validators/UpdateLeaveSessionValidator'
import { DateTime } from 'luxon'
import { validate as uuidValidation } from "uuid"
import Env from "@ioc:Adonis/Core/Env"
import Drive from '@ioc:Adonis/Core/Drive'
import EmployeeUnit from 'App/Models/EmployeeUnit'

const getSignedUrl = async (filename: string) => {
  const beHost = Env.get('BE_URL')
  const hrdDrive = Drive.use('hrd')
  const signedUrl = beHost + await hrdDrive.getSignedUrl('leave_sessions/' + filename, { expiresIn: '30mins' })
  return signedUrl
}

export default class LeaveSessionsController {
  public async index({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { page = 1, limit = 10, keyword = "", fromDate = "", toDate = "", status = "" } = request.qs()

    if (DateTime.fromISO(fromDate) > DateTime.fromISO(toDate)) {
      return response.badRequest({ message: "INVALID_DATE_RANGE" })
    }

    const unitIds = await unitHelper()
    const superAdmin = await checkRoleSuperAdmin()

    try {
      let data

      // cek role
      const user = await User.query().preload('roles', r => r.preload('role')).where('id', auth.use('api').user!.id).firstOrFail()
      const userObject = JSON.parse(JSON.stringify(user))

      const roles = RolesHelper(userObject)

      if (roles.includes('super_admin') || roles.includes('admin_hrd')) {
        const unitLead = await EmployeeUnit.query()
          .where('employee_id', auth.user!.$attributes.employeeId)
          .andWhere('title', 'lead')
          .first()
        const unitLeadObject = JSON.parse(JSON.stringify(unitLead))

        data = await LeaveSession.query()
          .preload('employee', em => em.select('name'))
          .whereHas('employee', e => e.whereILike('name', `%${keyword}%`))
          .preload('unit', u => u.select('name'))
          .andWhere(query => {
            if (fromDate && toDate) {
              query.whereBetween('date', [fromDate, toDate])
            }
          })
          .andWhereILike('status', `%${status}%`)
          // .andWhere(query => {
          //   if (employeeId) {
          //     query.where('employee_id', employeeId)
          //   }
          // })
          .if(!superAdmin, query => {
            query.where('unit_id', unitLeadObject.unit_id)
            query.orWhere('employee_id', auth.user!.$attributes.employeeId)
          })
          .orderBy('date', 'desc')
          .paginate(page, limit)
      } else {
        data = await LeaveSession.query()
          .preload('employee', em => em.select('name'))
          .preload('unit', u => u.select('name'))
          .whereHas('employee', e => e.whereILike('name', `%${keyword}%`))
          .andWhere(query => {
            if (fromDate && toDate) {
              query.whereBetween('date', [fromDate, toDate])
            }
          })
          .andWhere(query => {
            query.where('employee_id', userObject.employee_id)
          })
          .andWhereILike('status', `%${status}%`)
          .if(!superAdmin, query => {
            query.whereIn('unit_id', unitIds)
          })
          .orderBy('date', 'desc')
          .paginate(page, limit)
      }

      const dataObject = JSON.parse(JSON.stringify(data))

      dataObject.data.map(async (value) => {
        if (value.image) {
          value.image = await getSignedUrl(value.image)
        }
      })

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Data Berhasil Didapatkan", data: dataObject })
    } catch (error) {
      const message = "HRDLES01: " + error.message || error;
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
    const payload = await request.validate(CreateLeaveSessionValidator)

    //cek lead
    const superAdmin = await checkRoleSuperAdmin()
    if (!superAdmin && payload.status) {
      const unitLead = await EmployeeUnit.query()
        .where('employee_id', auth.user!.$attributes.employeeId)
        .andWhere('title', 'lead')
        .first()
      if (unitLead?.unitId !== payload.unitId && unitLead?.employeeId !== payload.employeeId) {
        return response.badRequest({ message: "Gagal menambah data dikarenakan anda bukan ketua unit tersebut" });
      } else if (unitLead?.unitId === payload.unitId && unitLead?.employeeId !== payload.employeeId) {
        return response.badRequest({ message: "Gagal menambah data dikarenakan karyawan tersebut bukan anggota unit anda" });
      }
    }

    try {
      let data
      if (payload.image) {
        const image = Math.floor(Math.random() * 1000) + DateTime.now().toUnixInteger().toString() + "." + payload.image.extname
        await payload.image.moveToDisk(
          'leave_sessions',
          { name: image, overwrite: true },
          'hrd'
        )
        data = await LeaveSession.create({ ...payload, image });
        data.image = await getSignedUrl(data.image)
      }
      else {
        data = await LeaveSession.create({
          employeeId: payload.employeeId,
          status: payload.status,
          date: payload.date,
          note: payload.note,
          sessions: payload.sessions,
          unitId: payload.unitId,
        })
      }

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.created({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      const message = "HRDLES02: " + error.message || error;
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
      return response.badRequest({ message: "LeaveSession ID tidak valid" });
    }

    try {
      const data = await LeaveSession.query().where("id", id).firstOrFail();
      const dataObject = JSON.parse(JSON.stringify(data))

      if (dataObject.image) {
        dataObject.image = await getSignedUrl(dataObject.image)
      }

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", data: dataObject });
    } catch (error) {
      const message = "HRDLES03: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async update({ params, request, response, auth }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "LeaveSession ID tidak valid" });
    }

    const payload = await request.validate(UpdateLeaveSessionValidator);
    const objectPayload = JSON.parse(JSON.stringify(payload))
    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }
    try {
      const leave = await LeaveSession.findOrFail(id);

      // cek lead unit
      const superAdmin = await checkRoleSuperAdmin()
      if (!superAdmin && payload.status) {
        const unitLead = await EmployeeUnit.query()
          .where('employee_id', auth.user!.$attributes.employeeId)
          .andWhere('title', 'lead')
          .first()
        if (unitLead?.unitId !== leave.unitId) {
          return response.badRequest({ message: "Gagal update status izin dikarenakan anda bukan ketua unit tersebut" });
        }
      }

      if (payload.image) {
        const image = Math.floor(Math.random() * 1000) + DateTime.now().toUnixInteger().toString() + "." + payload.image.extname
        await payload.image.moveToDisk(
          'leave_sessions',
          { name: image, overwrite: true },
          'hrd'
        )
        if (leave.image) {
          await Drive.use('hrd').delete('leave_sessions/' + leave.image)
        }

        objectPayload.image = image
      }

      const data = await leave.merge(objectPayload).save();
      if (data.image) {
        data.image = await getSignedUrl(data.image)
      }

      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "HRDLES04: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengubah data",
        error: message,
        error_data: error,
      });
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "LeaveSession ID tidak valid" });
    }

    try {
      const data = await LeaveSession.findOrFail(id);
      await data.delete();
      if (data.image) {
        await Drive.use('hrd').delete('leave_sessions/' + data.image)
      }
      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      const message = "HRDLES05: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }
}
