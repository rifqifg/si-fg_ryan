import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateSubjectValidator from 'Academic/Validators/CreateSubjectValidator';
import Subject from 'Academic/Models/Subject';
import { validate as uuidValidation } from "uuid";
import UpdateSubjectValidator from '../../Validators/UpdateSubjectValidator';

export default class SubjectsController {
  public async index({request, response}: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", mode = "page" } = request.qs()

    try {
      let data = {}
      if (mode === "page") {
        data = await Subject
          .query()
          .whereILike('name', `%${keyword}%`)
          .orderBy('name')
          .paginate(page, limit)
      } else if (mode === "list") {
        data = await Subject
        .query()
        .whereILike('name', `%${keyword}%`)
        .orderBy('name')
      } else {
        return response.badRequest({ message: "Mode tidak dikenali, (pilih: page / list)" })
      }

      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      const message = "ACSU28: " + error.message || error
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error
      })
    }
  }

  public async store({request, response}: HttpContextContract) {
    const payload = await request.validate(CreateSubjectValidator)
    try {
      const data = await Subject.create(payload)      
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      const message = "ACSU44: " + error.message || error
      console.log(error);
      response.badRequest({
        message: "Gagal menyimpan data",
        error: message,
        error_data: error
      })
    }
  }

  public async show({params, response}: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "Subject ID tidak valid" }) }

    try {
      const data = await Subject
        .query()
        .where('id', id).firstOrFail()
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      const message = "ACSU65: " + error.message || error
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error
      })
    }
  }

  public async update({params, request, response}: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "Subject ID tidak valid" }) }

    const payload = await request.validate(UpdateSubjectValidator)
    if (JSON.stringify(payload) === '{}') {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" })
    }
    try {
      const subject = await Subject.findOrFail(id)
      const data = await subject.merge(payload).save()
      response.ok({ message: "Berhasil mengubah data", data })
    } catch (error) {
      const message = "ACSU90: " + error.message || error
      console.log(error);
      response.badRequest({
        message: "Gagal mengubah data",
        error: message,
        error_data: error
      })
    }
  }

  public async destroy({params, response}: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "Subject ID tidak valid" }) }

    try {
      const data = await Subject.findOrFail(id)
      await data.delete()
      response.ok({ message: "Berhasil menghapus data" })
    } catch (error) {
      const message = "ACSU109: " + error.message || error
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error
      })
    }
  }
}
