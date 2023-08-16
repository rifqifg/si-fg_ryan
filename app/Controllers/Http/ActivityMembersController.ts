import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ActivityMember from 'App/Models/ActivityMember';
import CreateActivityMemberValidator from 'App/Validators/CreateActivityMemberValidator';

export default class ActivityMembersController {
  public async index({ request, response }: HttpContextContract) {
    const { activityId = "" } = request.qs()

    const data = await ActivityMember.query()
      .where('activity_id', '=', activityId)
      .preload('employee', e => e.select('id', 'name'))
      .preload('activity', a => a.select('id', 'name'))

    response.ok({ message: "Data Berhasil Didapatkan", data })
  }

  // public async create({ }: HttpContextContract) { }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateActivityMemberValidator);

    const data = await ActivityMember.createMany(payload.activityMembers);
    response.created({ message: "Berhasil menyimpan data", data });
  }

  public async show({ }: HttpContextContract) { }

  // public async edit({ }: HttpContextContract) { }

  public async update({ }: HttpContextContract) { }

  public async destroy({ }: HttpContextContract) { }
}
