import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { RolesHelper } from 'App/Helpers/rolesHelper'
import User from 'App/Models/User'
import Teacher from '../../Models/Teacher'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum';
import { DateTime } from 'luxon'

export default class AcademicDashboardController {
  public async index({ response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)

    try {
      const user = await User.query()
        .preload('roles', r => r.preload('role'))
        .preload('employee', e => e.select('id', 'name', 'foundation_id'))
        .where('employee_id', auth.user!.$attributes.employeeId)
        .firstOrFail()

      const userObject = JSON.parse(JSON.stringify(user))
      const infoGuru = await this.getTeacherInfoByUser(userObject)

      const data = {
        infoGuru: infoGuru
      }

      return data
    } catch (error) {
      const message = "ACDASH01: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  private async getTeacherInfoByUser(userObj) {
    // NOTE: await di pemanggilan RolesHelper dihapus, klo ngebug coba cek lagi
    const roles = RolesHelper(userObj)

    // jika bukan guru, return objek kosong
    if (roles.includes('super_admin') || roles.includes('admin_foundation')) return {}

    const teacher = await Teacher.query().where('employee_id', userObj.employee.id)
      .preload('teaching', t => {
        t.select("id", "class_id", "subject_id")
          .preload('subject', s => s.select('name'))
          .preload('class', c => c.select('name'))
      })
      .preload('employee', e => e.select('id').preload('homeroomTeacher', ht => {
        ht.select('name')
      }))
      .firstOrFail()

    // data kelas & subject no duplikat
    const teachingClasses: string[] = []
    const teachingSubjects: string[] = []

    teacher.teaching.forEach(teach => {
      if (teach.class !== null && !(teachingClasses.includes(teach.class.name!))) {
        teachingClasses.push(teach.class.name!)
      }

      if (!(teachingSubjects.includes(teach.subject.name!))) {
        teachingSubjects.push(teach.subject.name!)
      }
    })

    return {
      waliKelas: teacher.employee.homeroomTeacher ? teacher.employee.homeroomTeacher.name : '-',
      mengajar: teachingSubjects.join(' - '),
      kelas: teachingClasses.join(' - ')
    }
  }
}
