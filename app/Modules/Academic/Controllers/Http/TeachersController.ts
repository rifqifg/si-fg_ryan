import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateTeacherValidator from '../../Validators/CreateTeacherValidator';
import Teacher from 'Academic/Models/Teacher';

//TODO: CRUD Teacher
export default class TeachersController {
  public async index({request, response}: HttpContextContract) { // @ts-ignore
    const { page = 1, limit = 10, keyword = "", mode = "page" } = request.qs()

    try {
      let data = {}
      if (mode === "page") {
        data = await Teacher
          .query()
          .preload('employee', query => {query.select('id', 'name')})
          .paginate(page, limit)
      } else if (mode === "list") {
        data = await Teacher
          .query()
          .preload('employee', query => {query.select('id', 'name', 'nip')})
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
      const message = "ACTE44: " + error.message || error
      // console.log(error);
      response.badRequest({
        message: "Gagal menyimpan data",
        error: message,
        error_data: error
      })
    }
  }

  public async show({ }: HttpContextContract) { }

  public async destroy({ }: HttpContextContract) { }
}
