import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateTeacherValidator from '../../Validators/CreateTeacherValidator';
import Teacher from 'Academic/Models/Teacher';
import { validate as uuidValidation } from "uuid";

//TODO: CRUD Teacher
export default class TeachersController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", mode = "page" } = request.qs()

    try {
      let data = {}
      if (mode === "page") {
        data = await Teacher
          .query()
          .preload('employee', query => { query.select('id', 'name', 'nip').whereILike('name', `%${keyword}%`)})
          .paginate(page, limit)
      } else if (mode === "list") {
        data = await Teacher
          .query()
          .preload('employee', query => { query.select('id', 'name', 'nip') })
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

  public async store({ request, response }: HttpContextContract) {

    const payload = await request.validate(CreateTeacherValidator)
    try {
      const data = await Teacher.create(payload)
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      const message = "ACTE45: " + error.message || error
      // console.log(error);
      response.badRequest({
        message: "Gagal menyimpan data",
        error: message,
        error_data: error
      })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "Teacher ID tidak valid" }) }

    try {
      const data = await Teacher
        .query()
        .preload('employee',
          query => query
            .preload('divisions', d => d.preload('division', x => x.select('name')))
        )
        .where('id', id).firstOrFail()
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      const message = "ACTE69: " + error.message || error
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error
      })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "Teacher ID tidak valid" }) }

    try {
      const data = await Teacher.findOrFail(id)
      await data.delete()
      response.ok({ message: "Berhasil menghapus data" })
    } catch (error) {
      const message = "ACTE88: " + error.message || error
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error
      })
    }
  }
}
