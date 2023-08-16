import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ActivityMember from 'App/Models/ActivityMember';
import CreateActivityMemberValidator from 'App/Validators/CreateActivityMemberValidator';
import UpdateActivityMemberValidator from 'App/Validators/UpdateActivityMemberValidator';

export default class ActivityMembersController {
  public async index({ request, response }: HttpContextContract) {
    const { activityId = "" } = request.qs()

    const data = await ActivityMember.query()
      .where('activity_id', '=', activityId)
      .preload('employee', e => e.select('id', 'name'))
      .preload('activity', a => a.select('id', 'name'))

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

  public async update({ request, response }: HttpContextContract) {
    const payload = await request.validate(UpdateActivityMemberValidator);
    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }

    const rawBody = request.raw();
    const datas = JSON.parse(rawBody!);

    datas.activityMembers.map(async (value, index) => {
      const data = await ActivityMember.findOrFail(value.id)
      await data.merge(payload.activityMembers[index]).save()
    })

    response.ok({ message: "Update data success", datas })
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
}
