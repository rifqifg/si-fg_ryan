import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { validate as uuidValidation } from "uuid"
import Foundation from '../../Models/Foundation'
import CreateFoundationValidator from '../../Validators/CreateFoundationValidator'
import UpdateFoundationValidator from '../../Validators/UpdateFoundationValidator'

export default class FondationsController {
  public async index({ request, response }: HttpContextContract) {
    const { keyword = "", page = 1, limit = 10 } = request.qs()

    try {
      const data = await Foundation.query()
        .whereILike('name', `%${keyword}%`)
        .orderBy('name')
        .paginate(page, limit)

      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      const message = "FN01: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateFoundationValidator)

    try {
      const data = await Foundation.create(payload);
      response.created({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      const message = "FN02: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Foundation ID tidak valid" });
    }

    try {
      const data = await Foundation.query().where("id", id).firstOrFail();
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "FN03: " + error.message || error;
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
      return response.badRequest({ message: "AssessmentComponent ID tidak valid" });
    }

    const payload = await request.validate(UpdateFoundationValidator);
    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }
    try {
      const assessmentComponent = await Foundation.findOrFail(id);
      const data = await assessmentComponent.merge(payload).save();
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "FN04: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengubah data",
        error: message,
        error_data: error,
      });
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Foundation ID tidak valid" });
    }

    try {
      const data = await Foundation.findOrFail(id);
      await data.delete();
      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      const message = "FN05: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }
}
