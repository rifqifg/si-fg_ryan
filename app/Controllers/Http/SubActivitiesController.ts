import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SubActivity from 'App/Models/SubActivity';
import CreateSubActivityValidator from 'App/Validators/CreateSubActivityValidator'
import { DateTime } from 'luxon';
import { validate as uuidValidation } from "uuid";
import Drive from '@ioc:Adonis/Core/Drive'
import UpdateSubActivityValidator from 'App/Validators/UpdateSubActivityValidator';
import Env from "@ioc:Adonis/Core/Env"
import CreatePresenceSubActivityValidator from 'App/Validators/CreatePresenceSubActivityValidator';
import ActivityMember from 'App/Models/ActivityMember';
import { RoleActivityMember } from 'App/lib/enum';
import Presence from 'App/Models/Presence';
import DeleteManyPresenceValidator from 'App/Validators/DeleteManyPresenceValidator';
import User from 'App/Models/User';
import Database from '@ioc:Adonis/Lucid/Database';
import Activity from 'App/Models/Activity';
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist';
import { statusRoutes } from 'App/Modules/Log/lib/enum';

const getSignedUrl = async (filename: string) => {
  const beHost = Env.get('BE_URL')
  const hrdDrive = Drive.use('hrd')
  const signedUrl = beHost + await hrdDrive.getSignedUrl('subActivities/' + filename, { expiresIn: '30mins' })
  return [filename, signedUrl]
}

const hasDuplicateEmployeeId = (presences) => {
  const employeeIdMap = {};

  for (const presence of presences) {
    if (employeeIdMap[presence.employeeId]) {
      return true; // Found a duplicate
    }
    employeeIdMap[presence.employeeId] = true;
  }

  return false; // No duplicates found
}

export default class SubActivitiesController {
  public async index({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const hariIni = DateTime.now().toSQLDate()!.toString();
    const { activityId = "", keyword = "", page = 1, limit = 10, fromDate, toDate } = request.qs()

    if (!uuidValidation(activityId)) {
      return response.badRequest({ message: "Activity ID tidak valid" });
    }

    let data;

    if (fromDate && toDate) {
      const splittedFromDate = fromDate.split(" ")[0];
      const splittedToDate = toDate.split(" ")[0];

      const formattedStartDate = `${splittedFromDate ? splittedFromDate : hariIni
        } 00:00:00.000 +0700`;
      const formattedEndDate = `${splittedToDate ? splittedToDate : hariIni
        } 23:59:59.000 +0700`;

      data = await SubActivity.query()
        .where('activity_id', '=', activityId)
        .whereILike('name', `%${keyword}%`)
        .whereBetween("date", [formattedStartDate, formattedEndDate])
        .withCount('presence')
        .paginate(page, limit)
    } else {
      data = await SubActivity.query()
        .where('activity_id', '=', activityId)
        .whereILike('name', `%${keyword}%`)
        .withCount('presence')
        .paginate(page, limit)
    }

    CreateRouteHist(statusRoutes.FINISH, dateStart)
    response.ok({ message: "Data Berhasil Didapatkan", data })
  }

  public async store({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const payload = await request.validate(CreateSubActivityValidator)

    let nameFileImage: string[] = [] //buat nampung nama file image

    if (payload.images) {
      for (let i = 0; i < payload.images!.length; i++) {
        const imageName = Math.floor(Math.random() * 1000) + DateTime.now().toUnixInteger().toString() + "." + payload.images![i].extname

        nameFileImage.push(imageName)

        await payload.images![i].moveToDisk(
          'subActivities',
          { name: imageName, overwrite: true },
          'hrd'
        )

      }
    }
    //@ts-ignore
    payload.images = nameFileImage

    try {
      const data = await SubActivity.create(payload);
      for (let i = 0; i < data.images.length; i++) {
        data.images[i] = await getSignedUrl(data.images[i]);
      }
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.created({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      response.badRequest({
        message: "Gagal menyimpan data",
        error: error.message,
      });
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "SubActivity ID tidak valid" }) }

    try {
      const data = await SubActivity.query().where('id', id)
        .preload('presence', p =>
          p.select('*').where('sub_activity_id', '=', id)
            .preload('employee', e => e.select('name')))
        .firstOrFail()

      for (let i = 0; i < data.images.length; i++) {
        data.images[i] = await getSignedUrl(data.images[i]);
      }

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      console.log(error);
      response.badRequest({ message: "Gagal mengambil data", error: error.message })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "SubActivity ID tidak valid" }) }

    const payload = await request.validate(UpdateSubActivityValidator)

    if (JSON.stringify(payload) === '{}') {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" })
    }

    let nameFileImage: string[] = [] //buat nampung nama file image

    const subActivities = await SubActivity.findOrFail(id)

    if (payload.images) {
      payload.images!.forEach(async image => {
        const imageName = Math.floor(Math.random() * 1000) + DateTime.now().toUnixInteger().toString() + "." + image!.extname

        nameFileImage.push(imageName)

        await image.moveToDisk(
          'subActivities',
          { name: imageName, overwrite: true },
          'hrd'
        )
      })
    }

    if (payload.deleteImages) {
      const deleteImagesSplit = payload.deleteImages!.split(',');

      deleteImagesSplit.forEach(async deleteImage => {
        subActivities.images.filter(image => { image !== deleteImage });
        await Drive.use('hrd').delete('subActivities/' + deleteImage)
      })
      let updateSubActivityImages = subActivities.images.filter(image => !payload.deleteImages!.includes(image));
      //@ts-ignore
      payload["images"] = nameFileImage.concat(updateSubActivityImages)
    } else {
      //@ts-ignore
      payload["images"] = nameFileImage.concat(subActivities.images)
    }

    try {
      if (payload.hasOwnProperty("deleteImages")) {
        delete payload["deleteImages"];
      }

      await subActivities.merge(payload).save()
      for (let i = 0; i < subActivities.images.length; i++) {
        subActivities.images[i] = await getSignedUrl(subActivities.images[i]);
      }
      response.created({ message: "Berhasil mengupdate data", data: subActivities })
    } catch (error) {
      console.log(error);
      response.badRequest({ message: "Gagal mengupdate data", error: error.message })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "SubActivity ID tidak valid" }) }

    try {
      const data = await SubActivity.findOrFail(id)
      await data.delete()
      if (data.images.length > 0) { //kalo sebelumnya sudah ada image, maka image tsb dihapus
        data.images.forEach(async image => {
          await Drive.use('hrd').delete('subActivities/' + image)
        })
      }

      response.ok({ message: "Berhasil menghapus data" })
    } catch (error) {
      console.log(error);
      response.badRequest({ message: "Gagal menghapus data", error: error.message })
    }
  }

  public async getPresenceSubActivity({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { subActivityId = "", keyword = "", page = 1, limit = 10 } = request.qs()

    try {
      const data = await Presence.query()
        .select('id', 'activity_id', 'sub_activity_id', 'employee_id')
        .where('sub_activity_id', subActivityId)
        .andWhere(query => {
          query.orWhereHas('employee', query => {
            query.whereILike('name', `%${keyword}%`)
          })
        })
        .preload('employee', e => e.select('name'))
        .paginate(page, limit)

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Data Berhasil Didapatkan", data })
    } catch (error) {
      const message = "HRDPSA03-presences: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal Mengambil Data",
        error: message,
      });
    }

  }

  public async presence({ request, params, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { activityId, subActivityId } = params
    if (!uuidValidation(activityId)) { return response.badRequest({ message: "Activity ID tidak valid" }) }

    const payload = await request.validate(CreatePresenceSubActivityValidator)

    const user = await User.query().preload('roles', r => r.preload('role')).where('id', auth.use('api').user!.id).firstOrFail()
    const userObject = JSON.parse(JSON.stringify(user))

    const authRole = userObject.roles[0].role_name
    const authEmployeeId = auth.user?.$original.employeeId

    const getActivityMember = await ActivityMember.query()
      .where('activity_id', '=', activityId)
    let memberManager: string[] = [] // buat menampun employeeId dengan member role manager

    getActivityMember.map(value => { // mencari member dengan role manager
      if (value.role == RoleActivityMember.MANAGER) {
        if (authEmployeeId == value.employeeId) { // mengecek apakah user yg login itu sama dengan member dgn role manager
          memberManager.push(value.employeeId)
        }
      }
    })

    try {
      const existingPresenceSubActivity = await Presence.query()
        .where('sub_activity_id', subActivityId)
      // buat ngecek apabila employee sudah absen
      if (existingPresenceSubActivity.length > 0) {
        existingPresenceSubActivity.forEach(obj1 => {
          const match = payload.presences.find(obj2 => obj1.employeeId === obj2.employeeId);
          if (match) {
            throw new Error(
              "Abensi Karyawan pada kegiatan ini sudah ada"
            );
          }
        });
      }

      if (authRole == 'super_admin' || memberManager.length > 0) { // buat ngecek yang berwenang absen membernya
        if (payload.presences.length > 0 && hasDuplicateEmployeeId(payload.presences)) { return response.badRequest({ message: "Employee_ID Duplicated" }); }
        const data = await Presence.createMany(payload.presences)
        CreateRouteHist(statusRoutes.FINISH, dateStart)
        response.created({ message: "Create data success", data })
      } else {
        return response.badRequest({ message: "Permission Denied" })
      }
    } catch (error) {
      const message = "HRDPSA01-presences: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal Menambah Data",
        error: message,
      });
    }
  }

  public async destroyPresences({ request, response }: HttpContextContract) {

    const payload = await request.validate(DeleteManyPresenceValidator)

    try {
      const presenceIds = payload.presences.map(sm => sm)

      await Presence.query().whereIn("id", presenceIds).delete()

      response.ok({ message: 'Berhasil menghapus banyak data' })
    } catch (error) {
      response.badRequest({ message: "Gagal menghapus banyak data" })
    }
  }

  public async recap({ params, request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const hariIni = DateTime.now().toSQLDate()?.toString()
    const { page = 1, limit = 10, fromDate = hariIni, toDate = hariIni } = request.qs()
    const { activityId } = params

    try {
      const data = await Presence.query()
        .select('employee_id')
        .select(
          Database.raw('COUNT(employee_id) as presence_count'),
          Database.raw(
            `(SELECT COUNT(DISTINCT sub_activity_id) FROM presences WHERE activity_id = ? AND created_at >= ? AND created_at <= ?) AS total_sessions`,
            [activityId, fromDate + ' 00:00:00', toDate + ' 23:59:59']
          ),
          Database.raw(
            '( COUNT(employee_id) * 100 ) / NULLIF((SELECT COUNT(DISTINCT sub_activity_id) FROM presences WHERE activity_id = ? AND created_at >= ? AND created_at <= ? ), 0) AS percentage',
            [activityId, fromDate + ' 00:00:00', toDate + ' 23:59:59']
          ),
        )
        .preload('employee', e => e.select('name'))
        .where('activity_id', activityId)
        .whereBetween("created_at", [fromDate + ' 00:00:00', toDate + ' 23:59:59'])
        .groupBy('employee_id')
        .paginate(page, limit)

      const activity = await Activity.query()
        .where('id', activityId)
        .preload('categoryActivity', ca => ca.select('name'))
        .preload('division', d => d.select('name'))
        .firstOrFail()

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Data Berhasil Didapatkan", data, activity })
    } catch (error) {
      const message = "HRDRSA01-recap-subActivities: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal Menambah Data",
        error: message,
      });
    }
  }
}
