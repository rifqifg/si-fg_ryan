import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ActivityMember from 'App/Models/ActivityMember';
import Employee from 'App/Models/Employee';
import CreateActivityMemberValidator from 'App/Validators/CreateActivityMemberValidator';
import UpdateActivityMemberValidator from 'App/Validators/UpdateActivityMemberValidator';
import { validate as uuidValidation } from "uuid";

export default class ActivityMembersController {
  public async index({ request, response }: HttpContextContract) {
    const { activityId = "", keyword = "" } = request.qs()

    const data = await ActivityMember.query()
      .where('activity_id', '=', activityId)
      .preload('employee', e => e.select('id', 'name'))
      .preload('activity', a => a.select('id', 'name'))
      .andWhere(query => {
        query.orWhereHas('employee', query => {
          query.whereILike('name', `%${keyword}%`)
        })
      })


    response.ok({ message: "Data Berhasil Didapatkan", data })
  }

  public async store({ request, response }: HttpContextContract) {
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
      response.created({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      response.badRequest({ message: error.message });
    }
  }

  public async update({ request, response, params }: HttpContextContract) {
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

      response.ok({ message: "Update data success", data })
    } catch (error) {
      return response.badRequest({
        message: "Gagal mengubah data"
      })
    }
  }

  public async destroy({ request, response }: HttpContextContract) {
    const rawBody = request.raw();
    const datas = JSON.parse(rawBody!);

    datas.map(async value => {
      try {
        const data = await ActivityMember.findOrFail(value.member_id)
        await data.delete()
      } catch (error) {
        return response.badRequest({
          message: error.message
        })
      }
    })

    response.ok({ message: "Delete data success" })
  }

  public async getEmployee({ response, params, request }: HttpContextContract) {
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
      .whereNotIn('id', employeeIds)
      .whereILike('name', `%${keyword}%`)

    response.ok({ message: "Data Berhasil Didapatkan", data })
  }

  public async getActivityMemberAndEmployee({ params, request, response }: HttpContextContract) {
    try {
      const { activityId } = params
      const { keyword = "" } = request.qs()

      const dataActivityMembers = await ActivityMember.query()
        .where('activity_id', '=', activityId)
        .preload('employee', e => e.select('id', 'name'))
        .preload('activity', a => a.select('id', 'name'))
        .andWhere(query => {
          query.orWhereHas('employee', query => {
            query.whereILike('name', `%${keyword}%`)
          })
        })

      const employeeMemberIds: any = []

      dataActivityMembers.map(value => {
        employeeMemberIds.push(value.$attributes.employeeId)
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

      response.ok({ message: "Data Berhasil Didapatkan", data: [...dataActivityMembers, ...dataEmployeesObject] })
    } catch (error) {
      const message = "HRDAM06: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }
}
