import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import Notification from 'App/Models/Notification';
import UpdateBatchNotificationValidator from 'App/Validators/UpdateBatchNotificationValidator';
import UpdateNotificationValidator from 'App/Validators/UpdateNotificationValidator';
import { validate as uuidValidation } from "uuid"

export default class NotificationsController {
  public async index({ response, auth, request }: HttpContextContract) {
    const { page = 1, limit = 10 } = request.qs()
    try {
      const data = await Notification.query()
        .select('*')
        .select(Database.raw(`
            CASE
                WHEN EXTRACT(EPOCH FROM age(CURRENT_TIMESTAMP, date)) < 60 THEN
                    CONCAT(FLOOR(EXTRACT(EPOCH FROM age(CURRENT_TIMESTAMP, date))), ' s')
                WHEN EXTRACT(EPOCH FROM age(CURRENT_TIMESTAMP, date)) < 3600 THEN
                    CONCAT(FLOOR(EXTRACT(EPOCH FROM age(CURRENT_TIMESTAMP, date)) / 60), ' m')
                WHEN EXTRACT(EPOCH FROM age(CURRENT_TIMESTAMP, date)) < 86400 THEN
                    CONCAT(FLOOR(EXTRACT(EPOCH FROM age(CURRENT_TIMESTAMP, date)) / 3600), ' h')
                ELSE
                    CONCAT(FLOOR(EXTRACT(EPOCH FROM age(CURRENT_TIMESTAMP, date)) / 86400), ' d')
            END AS time_elapsed
        `))
        .where('user_id', auth.use('api').user!.id)
        .andWhere('read', false)
        .orderBy('date', 'desc')
        .paginate(page, limit)

      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      const message = "NOTIF01: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Notification ID tidak valid" });
    }

    const payload = await request.validate(UpdateNotificationValidator);
    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }
    try {
      const notif = await Notification.findOrFail(id);
      const data = await notif.merge(payload).save();
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "NOTIF02: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengubah data",
        error: message,
        error_data: error,
      });
    }
  }

  public async updateBatch({ request, response }: HttpContextContract) {
    const payload = await request.validate(UpdateBatchNotificationValidator)

    try {
      const data = await Notification.updateOrCreateMany("id", payload.notifications)

      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "NOTIF03: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengubah data",
        error: message,
        error_data: error,
      });
    }
  }
}
