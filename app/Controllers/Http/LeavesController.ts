import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { checkRoleSuperAdmin } from 'App/Helpers/checkRoleSuperAdmin'
import { RolesHelper } from 'App/Helpers/rolesHelper'
import { unitHelper } from 'App/Helpers/unitHelper'
import Leave from 'App/Models/Leave'
import User from 'App/Models/User'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'
import CreateLeaveValidator from 'App/Validators/CreateLeaveValidator'
import UpdateLeaveValidator from 'App/Validators/UpdateLeaveValidator'
import { DateTime } from 'luxon'
import { validate as uuidValidation } from "uuid"
import Env from "@ioc:Adonis/Core/Env"
import Drive from '@ioc:Adonis/Core/Drive'

const getSignedUrl = async (filename: string) => {
  const beHost = Env.get('BE_URL')
  const hrdDrive = Drive.use('hrd')
  const signedUrl = beHost + await hrdDrive.getSignedUrl('leaves/' + filename, { expiresIn: '30mins' })
  return signedUrl
}

export default class LeavesController {
  public async index({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { page = 1, limit = 10, keyword = "", fromDate = "", toDate = "", employeeId } = request.qs()
    const unitIds = await unitHelper()
    const superAdmin = await checkRoleSuperAdmin()

    //cek fromDate dan toDate
    if (DateTime.fromISO(fromDate) > DateTime.fromISO(toDate)) {
      return response.badRequest({ message: "INVALID_DATE_RANGE" })
    }

    try {
      let data

      // cek role
      const user = await User.query().preload('roles', r => r.preload('role')).where('id', auth.use('api').user!.id).firstOrFail()
      const userObject = JSON.parse(JSON.stringify(user))

      const roles = RolesHelper(userObject)

      if (roles.includes('super_admin') || roles.includes('admin_hrd')) {
        data = await Leave.query()
          .select('id', 'employee_id', 'status', 'reason', 'from_date', 'to_date', 'type', 'leaveStatus', 'unit_id', 'image')
          .preload('employee', em => em.select('name'))
          .preload('unit', u => u.select('name'))
          .whereHas('employee', e => e.whereILike('name', `%${keyword}%`))
          .andWhere(query => {
            if (fromDate && toDate) {
              query.whereBetween('from_date', [fromDate, toDate])
              query.orWhereBetween('to_date', [fromDate, toDate])
            }
          })
          .andWhere(query => {
            //TODO: menghilangkan parameter employeeId
            if (employeeId) {
              query.where('employee_id', employeeId)
            }
          })
          .if(!superAdmin, query => {
            query.whereIn('unit_id', unitIds)
          })
          .paginate(page, limit)
      } else {
        data = await Leave.query()
          .select('id', 'employee_id', 'status', 'reason', 'from_date', 'to_date', 'type', 'leaveStatus', 'unit_id', 'image')
          .preload('employee', em => em.select('name'))
          .preload('unit', u => u.select('name'))
          .whereHas('employee', e => e.whereILike('name', `%${keyword}%`))
          .andWhere(query => {
            if (fromDate && toDate) {
              query.whereBetween('from_date', [fromDate, toDate])
              query.orWhereBetween('to_date', [fromDate, toDate])
            }
          })
          .andWhere(query => {
            query.where('employee_id', userObject.employee_id)
          })
          .if(!superAdmin, query => {
            query.whereIn('unit_id', unitIds)
          })
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
      const message = "HRDLE01: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)

    const payload = await request.validate(CreateLeaveValidator)
    if (payload.fromDate! > payload.toDate!) {
      return response.badRequest({ message: "INVALID_DATE_RANGE" })
    }

    try {
      let data
      if (payload.image) {
        const image = Math.floor(Math.random() * 1000) + DateTime.now().toUnixInteger().toString() + "." + payload.image.extname
        await payload.image.moveToDisk(
          'leaves',
          { name: image, overwrite: true },
          'hrd'
        )
        data = await Leave.create({ ...payload, image });
        data.image = await getSignedUrl(data.image)
      } else {
        data = await Leave.create({
          employeeId: payload.employeeId,
          status: payload.status,
          reason: payload.reason,
          fromDate: payload.fromDate,
          toDate: payload.toDate,
          note: payload.note,
          type: payload.type,
          leaveStatus: payload.leaveStatus,
          unitId: payload.unitId,
        })
      }

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.created({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      const message = "HRDLE02: " + error.message || error;
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
      return response.badRequest({ message: "Leave ID tidak valid" });
    }

    try {
      const data = await Leave.query().where("id", id).firstOrFail();
      const dataObject = JSON.parse(JSON.stringify(data))

      if (dataObject.image) {
        dataObject.image = await getSignedUrl(dataObject.image)
      }

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", data: dataObject });
    } catch (error) {
      const message = "HRDLE03: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Leave ID tidak valid" });
    }

    const payload = await request.validate(UpdateLeaveValidator);
    const objectPayload = JSON.parse(JSON.stringify(payload))
    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }
    if (payload.fromDate! > payload.toDate!) {
      return response.badRequest({ message: "INVALID_DATE_RANGE" })
    }

    try {
      const leave = await Leave.findOrFail(id);

      if (payload.image) {
        const image = Math.floor(Math.random() * 1000) + DateTime.now().toUnixInteger().toString() + "." + payload.image.extname
        await payload.image.moveToDisk(
          'leaves',
          { name: image, overwrite: true },
          'hrd'
        )
        if (leave.image) {
          await Drive.use('hrd').delete('leaves/' + leave.image)
        }

        objectPayload.image = image
      }

      const data = await leave.merge(objectPayload).save();
      if (data.image) {
        data.image = await getSignedUrl(data.image)
      }

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "HRDLE04: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengubah data",
        error: message,
        error_data: error,
      });
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Leave ID tidak valid" });
    }

    try {
      const data = await Leave.findOrFail(id);
      await data.delete();
      if (data.image) {
        await Drive.use('hrd').delete('leaves/' + data.image)
      }
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      const message = "HRDLE05: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }

}
