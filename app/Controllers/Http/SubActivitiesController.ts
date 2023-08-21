import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SubActivity from 'App/Models/SubActivity';
import CreateSubActivityValidator from 'App/Validators/CreateSubActivityValidator'
import { DateTime } from 'luxon';
import { validate as uuidValidation } from "uuid";
import Drive from '@ioc:Adonis/Core/Drive'
import UpdateSubActivityValidator from 'App/Validators/UpdateSubActivityValidator';
import Env from "@ioc:Adonis/Core/Env"

const getSignedUrl = async (filename: string) => {
  const beHost = Env.get('BE_URL')
  const hrdDrive = Drive.use('hrd')
  const signedUrl = beHost + await hrdDrive.getSignedUrl('subActivities/' + filename, { expiresIn: '30mins' })
  return [filename, signedUrl]
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
        .paginate(page, limit)
    } else {
      data = await SubActivity.query()
        .where('activity_id', '=', activityId)
        .whereILike('name', `%${keyword}%`)
        .paginate(page, limit)
    }

    response.ok({ message: "Data Berhasil Didapatkan", data })
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateSubActivityValidator)

    let nameFileImage: string[] = [] //buat nampung nama file image

    if (payload.images!.length > 0) {
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
      const data = await SubActivity.query().where('id', id).firstOrFail()

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
    }else {
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
}
