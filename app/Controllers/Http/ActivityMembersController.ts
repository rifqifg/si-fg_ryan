import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ActivityMember from 'App/Models/ActivityMember';
import Employee from 'App/Models/Employee';
import Presence from 'App/Models/Presence';
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist';
import { statusRoutes } from 'App/Modules/Log/lib/enum';
import CreateActivityMemberValidator from 'App/Validators/CreateActivityMemberValidator';
import UpdateActivityMemberValidator from 'App/Validators/UpdateActivityMemberValidator';
import { validate as uuidValidation } from "uuid";

function filteredDataMembersAndEmployees(dataMembersOrEmployees, dataPresences) {
  for (let i = 0; i < dataMembersOrEmployees.length; i++) {
    const memberEmployeeId = dataMembersOrEmployees[i].employee_id;
    for (let j = 0; j < dataPresences.length; j++) {
      const presenceEmployeeId = dataPresences[j].employee_id;
      if (memberEmployeeId === presenceEmployeeId) {
        // Hapus elemen dari member jika employee_id-nya ada di presence
        dataMembersOrEmployees.splice(i, 1);
        i--; // Kurangi i karena elemen telah dihapus
        break; // Keluar dari loop presence
      }
    }
  }
}
export default class ActivityMembersController {
  public async index({ request, response }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const { activityId = "", keyword = "" } = request.qs()

    try {
      const data = await ActivityMember.query()
        .where('activity_id', '=', activityId)
        .preload('employee', e => e.select('id', 'name'))
        .preload('activity', a => a.select('id', 'name'))
        .andWhere(query => {
          query.orWhereHas('employee', query => {
            query.whereILike('name', `%${keyword}%`)
          })
        })

      CreateRouteHist(request, statusRoutes.FINISH)
      response.ok({ message: "Data Berhasil Didapatkan", data })
    } catch (error) {
      const message = "HRDAM01: " + error.message || error;
      CreateRouteHist(request, statusRoutes.ERROR, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const payload = await request.validate(CreateActivityMemberValidator);

    const promises = payload.activityMembers.map(async value => {
      const cekMember = await ActivityMember
        .query()
        .where('role', '=', value.role)
        .andWhere('activity_id', '=', value.activityId)
        .andWhere('employee_id', '=', value.employeeId);

      if (cekMember.length > 0) {
        throw new Error("Member already exists");
      }

      return value;
    });

    try {
      await Promise.all(promises);

      const data = await ActivityMember.createMany(payload.activityMembers);
      CreateRouteHist(request, statusRoutes.FINISH)
      response.created({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      const message = "HRDAM02: " + error.message || error;
      CreateRouteHist(request, statusRoutes.ERROR, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async update({ request, response, params }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const { id } = params
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Subject ID tidak valid" });
    }

    const payload = await request.validate(UpdateActivityMemberValidator)
    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }

    try {
      const data = await ActivityMember.findOrFail(id)
      await data.merge(payload).save()

      CreateRouteHist(request, statusRoutes.FINISH)
      response.ok({ message: "Update data success", data })
    } catch (error) {
      const message = "HRDAM03: " + error.message || error;
      CreateRouteHist(request, statusRoutes.ERROR, message)
      console.log(error);
      response.badRequest({
        message: "Gagal update data",
        error: message,
        error_data: error,
      });
    }
  }

  public async destroy({ request, response }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const rawBody = request.raw();
    const datas = JSON.parse(rawBody!);

    datas.map(async value => {
      try {
        const data = await ActivityMember.findOrFail(value.member_id)
        await data.delete()
      } catch (error) {
        const message = "HRDAM04: " + error.message || error;
        CreateRouteHist(request, statusRoutes.ERROR, message)
        return response.badRequest({
          message: error.message
        })
      }
    })

    CreateRouteHist(request, statusRoutes.FINISH)
    response.ok({ message: "Delete data success" })
  }

  public async getEmployee({ response, params, request }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const { activityId } = params
    const { keyword = "" } = request.qs()

    const activityMembers = await ActivityMember.query()
      .select('id', 'employee_id')
      .where('activity_id', '=', activityId)

    const employeeIds: any = []

    activityMembers.map(value => {
      employeeIds.push(value.$attributes.employeeId)
    })

    const data = await Employee.query()
      .select('id', 'name')
      .whereNull('date_out')
      .whereNotIn('id', employeeIds)
      .whereILike('name', `%${keyword}%`)

    CreateRouteHist(request, statusRoutes.FINISH)
    response.ok({ message: "Data Berhasil Didapatkan", data })
  }

  public async getActivityMemberAndEmployee({ request, response }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    try {
      const { keyword = "", activityId, subActivityId = "" } = request.qs()

      let dataPresences: any = []
      if (subActivityId) {
        // mengambil data presensi buat filter data ketika tambah absensi
        dataPresences = await Presence.query()
          .select('id', 'activity_id', 'sub_activity_id', 'employee_id')
          .where('sub_activity_id', subActivityId)
          .preload('employee', e => e.select('name'))

        dataPresences = JSON.parse(JSON.stringify(dataPresences))
      }

      const dataActivityMembers = await ActivityMember.query()
        .where('activity_id', '=', activityId)
        .preload('employee', e => e.select('id', 'name'))
        .preload('activity', a => a.select('id', 'name'))
        .andWhere(query => {
          query.orWhereHas('employee', query => {
            query.whereILike('name', `%${keyword}%`)
          })
        })

      const dataActivityMembersObject = JSON.parse(JSON.stringify(dataActivityMembers))

      const employeeMemberIds: any = []

      dataActivityMembersObject.map(value => {
        employeeMemberIds.push(value.employee_id)
      })

      const dataEmployees = await Employee.query()
        .select('id', 'name')
        .whereNotIn('id', employeeMemberIds)
        .whereILike('name', `%${keyword}%`)
        .orderBy('name', 'asc')

      const dataEmployeesObject = JSON.parse(JSON.stringify(dataEmployees))

      dataEmployeesObject.map(value => {
        value["role"] = false
        value["activity_id"] = activityId
        value["employee"] = {
          id: value.id,
          name: value.name
        }
        value.employee_id = value.id
        delete value.name
      })

      //disini filter, klo sudah presensi maka gak usah di tampilin
      if (dataPresences.length != 0) {
        filteredDataMembersAndEmployees(dataActivityMembersObject, dataPresences)
        filteredDataMembersAndEmployees(dataEmployeesObject, dataPresences)
      }

      CreateRouteHist(request, statusRoutes.FINISH)
      response.ok({ message: "Data Berhasil Didapatkan", data: [...dataActivityMembersObject, ...dataEmployeesObject] })
    } catch (error) {
      const message = "HRDAM06: " + error.message || error;
      CreateRouteHist(request, statusRoutes.ERROR, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }
}
