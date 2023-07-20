import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Class from 'Academic/Models/Class'
import CreateClassValidator from 'Academic/Validators/CreateClassValidator'
import UpdateClassValidator from 'Academic/Validators/UpdateClassValidator'
import { validate as uuidValidation } from "uuid";
import Student from '../../Models/Student';

export default class ClassesController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", mode = "page", is_graduated = false } = request.qs()

    try {
      let data = {}
      if (mode === "page") {
        data = await Class
          .query()
          .preload('homeroomTeacher', query => query.select('name', 'nip'))
          .withCount('students')
          .whereILike('name', `%${keyword}%`)
          .where('is_graduated', '=', is_graduated)
          .orderBy('name')
          .paginate(page, limit)
      } else if (mode === "list") {
        data = await Class
          .query()
          .select('id', 'name', 'description', 'employeeId')
          .preload('homeroomTeacher', query => query.select('name', 'nip'))
          .withCount('students')
          .whereILike('name', `%${keyword}%`)
          .where('is_graduated', '=', is_graduated)
          .orderBy('name')
      } else {
        return response.badRequest({ message: "Mode tidak dikenali, (pilih: page / list)" })
      }

      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      response.badRequest({ message: "Gagal mengambil data", error: error.message })
    }
  }


  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateClassValidator)
    try {
      const data = await Class.create(payload)
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      console.log(error);
      response.badRequest({ message: "Gagal menyimpan data", error: error.message })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "Class ID tidak valid" }) }

    try {
      const data = await Class.query()
        .preload('homeroomTeacher', query => query.select('name', 'nip'))
        .preload('students', student => student.select('id', 'name', 'nis', 'nisn'))
        .where('id', id).firstOrFail()
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      console.log(error);
      response.badRequest({ message: "Gagal mengambil data", error: error.message })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "Class ID tidak valid" }) }

    const payload = await request.validate(UpdateClassValidator)
    if (JSON.stringify(payload) === '{}') {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" })
    }

    try {
      // update is_graduated siswa jika is_graduated kelas diubah
      if (payload.is_graduated != undefined) {
        let dataStudentsUpdate: any = []
        const dataStudents = await Student
          .query()
          .where('class_id', '=', id)

        dataStudents.map(value => {
          dataStudentsUpdate.push({
            id: value.$original.id,
            isGraduated: payload.is_graduated
          })
        })

        for (const studentData of dataStudentsUpdate) {
          const siswa = await Student.findOrFail(studentData.id)
          await siswa?.merge({isGraduated: studentData.isGraduated}).save()
        }
      }

      // update kelas
      const clazz = await Class.findOrFail(id)
      const data = await clazz.merge(payload).save()
      response.ok({ message: "Berhasil mengubah data", data })
    } catch (error) {
      console.log(error);
      response.badRequest({ message: "Gagal mengubah data", error: error.message })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    // TIPS: untuk validasi params.id, gunakan uuid.validate() seperti ini
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "Class ID tidak valid" }) }

    try {
      const data = await Class.findOrFail(id)
      await data.delete()
      response.ok({ message: "Berhasil menghapus data" })
    } catch (error) {
      console.log(error);
      response.badRequest({ message: "Gagal menghapus data", error: error.message })
    }
  }
}
