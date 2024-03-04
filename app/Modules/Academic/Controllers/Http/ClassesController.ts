import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Class from 'Academic/Models/Class'
import CreateClassValidator from 'Academic/Validators/CreateClassValidator'
import UpdateClassValidator from 'Academic/Validators/UpdateClassValidator'
import { validate as uuidValidation } from "uuid";
import Student from '../../Models/Student';
import { statusRoutes } from 'App/Modules/Log/lib/enum';
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist';
import { DateTime } from 'luxon';
import User from 'App/Models/User';
import { RolesHelper } from 'App/Helpers/rolesHelper';
import { checkRoleSuperAdmin } from 'App/Helpers/checkRoleSuperAdmin';

export default class ClassesController {
  public async index({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart);
    let { page = 1, limit = 10, keyword = "", mode = "page", is_graduated = false, foundationId } = request.qs()

    is_graduated = is_graduated == "true" ? true : false

    const user = await User.query()
      .preload('employee', e => e
        .select('id', 'name', 'foundation_id'))
      .preload('roles', r => r
        .preload('role'))
      .where('employee_id', auth.user!.$attributes.employeeId)
      .first()

    const userObject = JSON.parse(JSON.stringify(user))
    const roles = await RolesHelper(userObject)

    try {
      let data = {}
      if (mode === "page") {
        data = await Class
          .query()
          .preload('homeroomTeacher', query => query.select('name', 'nip')).preload('jurusan')
          .withCount('students')
          .whereILike('name', `%${keyword}%`)
          .if(typeof is_graduated === 'boolean', query => query.where('is_graduated', '=', is_graduated))
          .if(!roles.includes('super_admin'), query => query
            .where('foundation_id', user!.employee.foundationId)
          )
          .if(roles.includes('super_admin'), query => query
            .where('foundation_id', foundationId))
          .orderBy('name')
          .paginate(page, limit)
      } else if (mode === "list") {
        data = await Class
          .query()
          .select('id', 'name', 'description', 'employeeId')
          .preload('homeroomTeacher', query => query.select('name', 'nip'))
          .if(typeof is_graduated === 'boolean', query => query.where('is_graduated', '=', is_graduated))
          .if(!roles.includes('super_admin'), query => query
            .where('foundation_id', user!.employee.foundationId)
          )
          .if(roles.includes('super_admin'), query => query
            .where('foundation_id', foundationId))
          .withCount('students')
          .whereILike('name', `%${keyword}%`)
          .orderBy('name')
      } else {
        return response.badRequest({ message: "Mode tidak dikenali, (pilih: page / list)" })
      }

      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error);
      response.badRequest({ message: "Gagal mengambil data", error: error.message })
    }
  }


  public async store({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart);
    const payload = await request.validate(CreateClassValidator)
    try {
      const superAdmin = await checkRoleSuperAdmin()
      //kalo bukan superadmin maka foundationId nya di hardcode
      if (!superAdmin) {
        const user = await User.query()
          .preload('employee', e => e
            .select('id', 'name', 'foundation_id'))
          .where('employee_id', auth.user!.$attributes.employeeId)
          .first()

        payload.foundationId = user!.employee.foundationId
      }
      const data = await Class.create(payload)
      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error);
      console.log(error);
      response.badRequest({ message: "Gagal menyimpan data", error: error.message })
    }
  }

  public async show({ params, response, request }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart);
    const { id } = params
    const { keyword = "" } = request.qs()

    if (!uuidValidation(id)) { return response.badRequest({ message: "Class ID tidak valid" }) }

    try {
      const data = await Class.query()
        .preload('homeroomTeacher', query => query.select('name', 'nip'))
        .preload('students', student => student.select('id', 'name', 'nis', 'nisn').whereILike('name', `%${keyword}%`))
        .where('id', id).firstOrFail()
      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error);
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
          await siswa?.merge({ isGraduated: studentData.isGraduated }).save()
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
