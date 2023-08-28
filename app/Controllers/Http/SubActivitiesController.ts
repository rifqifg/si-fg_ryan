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

    response.ok({ message: "Data Berhasil Didapatkan", data })
  }

  public async store({ request, response }: HttpContextContract) {
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
      response.created({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      response.badRequest({
        message: "Gagal menyimpan data",
        error: error.message,
      });
    }
  }

  public async show({ params, response }: HttpContextContract) {
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

      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
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

  public async presence({ request, params, response, auth }: HttpContextContract) {
    const { activityId, subActivityId } = params
    if (!uuidValidation(activityId)) { return response.badRequest({ message: "Activity ID tidak valid" }) }

    const payload = await request.validate(CreatePresenceSubActivityValidator)
    const authRole = auth.user?.role
    const getActivityMember = await ActivityMember.query()
      .where('activity_id', '=', activityId)
    let memberManager: string[] = [] // buat menampun employeeId dengan member role manager

    getActivityMember.map(value => {
      if (value.role == RoleActivityMember.MANAGER) {
        memberManager.push(value.employeeId)
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
        response.created({ message: "Create data success", data })
      } else {
        return response.badRequest({ message: "Permission Denied" })
      }
    } catch (error) {
      const message = "HRDPSA01-presences: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal Menambah Data",
        error: message,
      });
    }

  }
}
