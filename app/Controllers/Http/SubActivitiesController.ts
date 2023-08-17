import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SubActivity from 'App/Models/SubActivity';
import CreateSubActivityValidator from 'App/Validators/CreateSubActivityValidator'
import { DateTime } from 'luxon';
import { validate as uuidValidation } from "uuid";

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

    try {
      const data = await SubActivity.create(payload);
      response.created({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      response.badRequest({
        message: "Gagal menyimpan data",
        error: error.message,
      });
    }
  }
}
