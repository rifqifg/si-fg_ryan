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
import EmployeeUnit from 'App/Models/EmployeeUnit'
import Notification from 'App/Models/Notification'
import { validator, schema, rules } from '@ioc:Adonis/Core/Validator'
import Employee from 'App/Models/Employee'

const getSignedUrl = async (filename: string) => {
  const beHost = Env.get('BE_URL')
  const hrdDrive = Drive.use('hrd')
  const signedUrl = beHost + await hrdDrive.getSignedUrl('leaves/' + filename, { expiresIn: '30mins' })
  return signedUrl
}

function translateStatus(status) {
  if (status == "aprove") {
    return "menyetujui";
  } else if (status == "rejected") {
    return "menolak";
  } else {
    return "menunggu";
  }
}

export default class LeavesController {
  public async index({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { page = 1, limit = 10, keyword = "", fromDate = "", toDate = "", status = "", leaveStatus = "" } = request.qs()
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
        const unitLead = await EmployeeUnit.query()
          .where('employee_id', auth.user!.$attributes.employeeId)
          .andWhere('title', 'lead')
          .first()
        const unitLeadObject = JSON.parse(JSON.stringify(unitLead))

        if(!superAdmin && !unitLeadObject) {
          return response.ok({ message: "Data Berhasil Didapatkan", data: {} })
        }

        data = await Leave.query()
          .preload('employee', em => em.select('name'))
          .preload('unit', u => u.select('name'))
          .andWhere(query => {
            if (fromDate && toDate) {
              query.whereBetween('from_date', [fromDate, toDate])
              query.orWhereBetween('to_date', [fromDate, toDate])
            }
          })
          .if(superAdmin, query => {
            query.whereHas('employee', e => e.whereILike('name', `%${keyword}%`))
            query.andWhereILike('status', `%${status}%`)
            query.andWhereILike('leave_status', `%${leaveStatus}%`)
          })
          // .if(!superAdmin && unitLeadObject && keyword === "" && status === "", query => {
          //   query.where('unit_id', unitLeadObject.unit_id)
          //   query.orWhere('employee_id', auth.user!.$attributes.employeeId)
          // })
          // .if(!superAdmin && unitLeadObject && (keyword !== "" || status !== ""), query => {
          .if(!superAdmin && unitLeadObject, query => {
            query.where('unit_id', unitLeadObject.unit_id)
            query.andWhere((query) => {
                query.andWhereHas('employee', e => e.whereILike('name', `%${keyword}%`))
                query.andWhereILike('status', `%${status}%`)
                query.andWhereILike('leave_status', `%${leaveStatus}%`)
              })
            query.orWhere('employee_id', auth.user!.$attributes.employeeId)
              .andWhereHas('employee', e => e.whereILike('name', `%${keyword}%`))
              .andWhereILike('status', `%${status}%`)
              .andWhereILike('leave_status', `%${leaveStatus}%`)
          })
          .orderBy('from_date', 'desc')
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
          .andWhereILike('status', `%${status}%`)
          .andWhereILike('leave_status', `%${leaveStatus}%`)
          .andWhereIn('unit_id', unitIds)
          .orderBy('from_date', 'desc')
          .paginate(page, limit)
      }

      const dataObject = JSON.parse(JSON.stringify(data))

      dataObject.data.map(async (value) => {
        if (value.image) {
          value.file_image = value.image
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

  public async store({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)

    const payload = await request.validate(CreateLeaveValidator)
    if (payload.fromDate! > payload.toDate!) {
      return response.badRequest({ message: "INVALID_DATE_RANGE" })
    }

    // cek role
    const user = await User.query().preload('roles', r => r.preload('role')).where('id', auth.use('api').user!.id).firstOrFail()
    const userObject = JSON.parse(JSON.stringify(user))

    const roles = RolesHelper(userObject)

    //cek lead
    if (roles.includes('admin_hrd')) {
      const unitLead = await EmployeeUnit.query()
        .where('employee_id', auth.user!.$attributes.employeeId)
        .andWhere('title', 'lead')
        .first()
      if (unitLead?.unitId !== payload.unitId && unitLead?.employeeId !== payload.employeeId) {
        return response.badRequest({ message: "Gagal menambah data dikarenakan anda bukan ketua unit tersebut" });
      }
      // else if(unitLead?.unitId === payload.unitId && unitLead?.employeeId !== payload.employeeId) {
      //   return response.badRequest({ message: "Gagal menambah data dikarenakan karyawan tersebut bukan anggota unit anda" });
      // }
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
          // type: payload.type,
          leaveStatus: payload.leaveStatus,
          unitId: payload.unitId,
        })
      }

      if (!roles.includes('super_admin')) {
        // push notifikasi ke ketua unit masing2
        const chekAdminUnit = await EmployeeUnit.query()
          .where('title', 'lead')
          .andWhere('unit_id', payload.unitId)
          .preload('employee', e => e.preload('user', u => u.select('id')))
          .first()

        const employee = await Employee.findOrFail(payload.employeeId)

        const checkAdminUnitObject = JSON.parse(JSON.stringify(chekAdminUnit))
        const CreateNotifValidator = await validator.validate({
          schema: schema.create({
            title: schema.string({}, [
              rules.minLength(3)
            ]),
            description: schema.string({}, [
              rules.minLength(3)
            ]),
            date: schema.date({ format: 'yyyy-MM-dd HH:mm:ss' }),
            type: schema.string(),
            userId: schema.string({}, [
              rules.exists({ table: 'users', column: 'id' })
            ]),
          }),
          data: {
            title: `Izin Cuti/Sakit`,
            description: `${employee.name.split(' ')[0]} mengajukan ${payload.leaveStatus}`,
            type: `leave_daily`,
            userId: checkAdminUnitObject.employee.user.id,
            date: DateTime.now().setZone('Asia/Jakarta').toFormat('yyyy-MM-dd HH:mm:ss').toString()
          }
        })

        await Notification.create(CreateNotifValidator)
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
        dataObject.file_image = dataObject.image
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

  public async update({ params, request, response, auth }: HttpContextContract) {
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
      const leave = await Leave.query()
        .where('id', id)
        .preload('employee', e => e
          .preload('user', u => u
            .select('id')))
        .firstOrFail()

      const user = await User.query().preload('roles', r => r.preload('role')).where('id', auth.use('api').user!.id).firstOrFail()
      const userObject = JSON.parse(JSON.stringify(user))
      const userRoles = RolesHelper(userObject)

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

      if (userRoles.includes('user_hrd') && !(userRoles.includes('admin_hrd'))) {
        console.log(leave.employee.id);
        console.log(auth.user!.$attributes.employeeId);
        if (leave.employee.id !== auth.user!.$attributes.employeeId) {
          return response.badRequest({ message: "Tidak dapat ubah data anggota lain, anda bukan ketua unit tersebut..." });
        }
      }

      //klo ganti gambar
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

      //klo hapus gambar
      if (payload.deleteImage) {
        await Drive.use('hrd').delete('leaves/' + leave.image)
        delete objectPayload["deleteImage"]
        if (!objectPayload.image) {
          objectPayload.image = null
        }
      }

      const data = await leave.merge(objectPayload).save();
      if (data.image) {
        data.image = await getSignedUrl(data.image)
      }

      // push notifikasi ke masing2 user buat mengetahui aprove / reject
      if (!superAdmin && payload.status && leave.employee.user) {
        const CreateNotifValidator = await validator.validate({
          schema: schema.create({
            title: schema.string({}, [
              rules.minLength(3)
            ]),
            description: schema.string({}, [
              rules.minLength(3)
            ]),
            date: schema.date({ format: 'yyyy-MM-dd HH:mm:ss' }),
            type: schema.string(),
            userId: schema.string({}, [
              rules.exists({ table: 'users', column: 'id' })
            ]),
          }),
          data: {
            title: `Izin Cuti/Sakit`,
            description: `Kepala unit ${translateStatus(payload.status)} izin kamu`,
            type: `leave_daily`,
            userId: leave.employee.user.id,
            date: DateTime.now().setZone('Asia/Jakarta').toFormat('yyyy-MM-dd HH:mm:ss').toString()
          }
        })

        await Notification.create(CreateNotifValidator)
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

  public async destroy({ params, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Leave ID tidak valid" });
    }
    try {
      const data = await Leave.findOrFail(id);

      // cek role
      const user = await User.query().preload('roles', r => r.preload('role')).where('id', auth.use('api').user!.id).firstOrFail()
      const userObject = JSON.parse(JSON.stringify(user))

      const roles = RolesHelper(userObject)

      //cek lead
      if (roles.includes('admin_hrd')) {
        const unitLead = await EmployeeUnit.query()
          .where('employee_id', auth.user!.$attributes.employeeId)
          .andWhere('title', 'lead')
          .first()

        if (unitLead?.unitId !== data.unitId && unitLead?.employeeId === data.employeeId) {
          return response.badRequest({ message: "Gagal menghapus data dikarenakan anda bukan ketua unit tersebut" });
        }
      }

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
