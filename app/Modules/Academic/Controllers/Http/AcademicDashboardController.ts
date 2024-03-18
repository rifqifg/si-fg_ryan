import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { RolesHelper } from 'App/Helpers/rolesHelper'
import User from 'App/Models/User'
import Teacher from '../../Models/Teacher'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum';
import { DateTime } from 'luxon'
import Class from '../../Models/Class'
import Database from '@ioc:Adonis/Lucid/Database'
import TeacherAttendance from '../../Models/TeacherAttendance'
import DailyAttendance from '../../Models/DailyAttendance'

export default class AcademicDashboardController {
  public async index({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)

    const { foundationId } = request.qs()

    try {
      // TODO: filter by foundation
      const user = await User.query()
        .preload('roles', r => r.preload('role'))
        .preload('employee', e => e.select('id', 'name', 'foundation_id'))
        .where('employee_id', auth.user!.$attributes.employeeId)
        .firstOrFail()

      const userObject = JSON.parse(JSON.stringify(user))
      const infoGuru = await this.getTeacherInfoByUser(userObject)
      const infoSiswa = await this.getStudentsSummary(userObject, foundationId)

      const data = { infoGuru, infoSiswa }

      return response.ok({ message: "Berhasil mengambil data", data })
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

  public async getTeacherAttendances({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)

    const { fromDate, toDate, foundationId } = request.qs()

    const formattedFromDate = fromDate ? DateTime.fromISO(fromDate).startOf('day').toISO()! : DateTime.local({zone:'utc+7'}).minus({days: 7}).startOf('day').toISO()!
    const formattedToDate = toDate ? DateTime.fromISO(toDate).endOf('day').toISO()! : DateTime.local({zone:'utc+7'}).endOf('day').toISO()!

    try {
      const user = await User.query()
        .preload('roles', r => r.preload('role'))
        .preload('employee', e => e.select('id', 'name', 'foundation_id'))
        .where('employee_id', auth.user!.$attributes.employeeId)
        .firstOrFail()

      const userObject = JSON.parse(JSON.stringify(user))
      const roles = RolesHelper(userObject)

      const isUserAcademicOnly = (
        roles.includes('user_academic')
        && !(roles.includes('admin_academic'))
        && !(roles.includes('admin_foundation'))
        && !(roles.includes('super_admin'))
      ) ? true : false

    const teacherAttendances = await TeacherAttendance.query()
      // NOTE: query select ini overwrite valuenya date_in. utk sekarang krna date_in sendiri ngga dipake jd gpp
      .select(Database.raw(`DATE_TRUNC('day', date_in) as date_in`))
      .select(
        Database.raw(
          `round(cast(sum(case when status = 'teach' or status = 'exam' or status = 'homework' then 1 else 0 end) * 100.0 / (count(status))as decimal(10,2)),1) as teach_precentage`
        ),
        Database.raw(
          `round(cast(sum(case when status = 'not_teach' then 1 else 0 end) * 100.0 / (count(status))as decimal(10,2)),1) as not_teach_precentage`
        )
      )
      .if(!roles.includes('super_admin'), query => query
        .andWhereHas('teacher', t => t.whereHas('employee', e => e
          .where('foundation_id', user!.employee.foundationId)
          .if(isUserAcademicOnly, uaQuery => {
            uaQuery.andWhere('id', auth.user!.$attributes.employeeId)
          })
        ))
      )
      .if(roles.includes('super_admin') && foundationId, query => query
        .andWhereHas('teacher', t => t.whereHas('employee', e => e
          .where('foundation_id', foundationId)))
      )
      .whereBetween("date_in", [formattedFromDate, formattedToDate])
      .groupByRaw(`DATE_TRUNC('day', date_in)`)

      const data: any = []
      teacherAttendances.forEach(ta => {
        const dateIn = ta.date_in.toFormat('dd-LL-yyyy', { locale: 'id' })

        const teach = {
          date: dateIn,
          name: "Mengajar",
          value: parseFloat(ta.$extras.teach_precentage)
        }

        const notTeach = {
          date: dateIn,
          name: "Tidak Mengajar",
          value: parseFloat(ta.$extras.not_teach_precentage)
        }

        data.push(teach, notTeach)
      })

      return response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      const message = "ACDASH02: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async getStudentAttendances({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)

    const { fromDate, toDate, foundationId } = request.qs()

    const formattedFromDate = fromDate ? DateTime.fromISO(fromDate).startOf('day').toISO()! : DateTime.local({zone:'utc+7'}).minus({days: 7}).startOf('day').toISO()!
    const formattedToDate = toDate ? DateTime.fromISO(toDate).endOf('day').toISO()! : DateTime.local({zone:'utc+7'}).endOf('day').toISO()!

    try {
      const user = await User.query()
        .preload('roles', r => r.preload('role'))
        .preload('employee', e => e.select('id', 'name', 'foundation_id'))
        .where('employee_id', auth.user!.$attributes.employeeId)
        .firstOrFail()

      const userObject = JSON.parse(JSON.stringify(user))
      const roles = RolesHelper(userObject)

      const isUserAcademicOnly = (
        roles.includes('user_academic')
        && !(roles.includes('admin_academic'))
        && !(roles.includes('admin_foundation'))
        && !(roles.includes('super_admin'))
      ) ? true : false

      if (isUserAcademicOnly) {
        return response.badRequest({ message: "user_academic tidak bisa akses data ini" })
      }

      const dailyAttendances = await DailyAttendance.query()
        .select(Database.raw(`DATE_TRUNC('day', date_in) as date_in`))
        .select(
          Database.raw(
            `round(cast(sum(case when status = 'present' then 1 else 0 end) * 100.0 / (count(status))as decimal(10,2)),1) as present_precentage`
          ),
          Database.raw(
            `round(cast(sum(case when status = 'permission' then 1 else 0 end) * 100.0 / (count(status))as decimal(10,2)),1) as permission_precentage`
          ),
          Database.raw(
            `round(cast(sum(case when status = 'sick' then 1 else 0 end) * 100.0 / (count(status))as decimal(10,2)),1) as sick_precentage`
          ),
          Database.raw(
            `round(cast(sum(case when status = 'absent' then 1 else 0 end) * 100.0 / (count(status))as decimal(10,2)),1) as absent_precentage`
          )
        )
        .whereBetween("date_in", [formattedFromDate, formattedToDate])
        .if(!roles.includes('super_admin') && foundationId, query => {
          query.andWhereHas('student', s => s.where('foundation_id', user!.employee.foundationId))
        })
        .if(roles.includes('super_admin') && foundationId, query => {
          query.andWhereHas('student', s => s.where('foundation_id', foundationId))
        })
        .groupByRaw(`DATE_TRUNC('day', date_in)`)

      const data: any[] = []
      dailyAttendances.forEach(da => {
        const dateIn = da.date_in.toFormat('dd-LL-yyyy', { locale: 'id' })

        const present = {
          date: dateIn,
          name: "Hadir",
          value: parseFloat(da.$extras.present_precentage)
        }

        const permission = {
          date: dateIn,
          name: "Izin",
          value: parseFloat(da.$extras.permission_precentage)
        }

        const sick = {
          date: dateIn,
          name: "Sakit",
          value: parseFloat(da.$extras.sick_precentage)
        }

        const absent = {
          date: dateIn,
          name: "Alpha",
          value: parseFloat(da.$extras.absent_precentage)
        }

        data.push(present, permission, sick, absent)
      })

      return response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      const message = "ACDASH03: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  private async getStudentsSummary(userObj, foundationId) {
    const roles = RolesHelper(userObj)

    const isUserAcademicOnly = (
      roles.includes('user_academic')
      && !(roles.includes('admin_academic'))
      && !(roles.includes('admin_foundation'))
      && !(roles.includes('super_admin'))
    ) ? true : false

    if (isUserAcademicOnly) return {}

    const classes = await Class.query()
      .select('name')
      .where('is_graduated', false)
      .if(!roles.includes('super_admin') && foundationId, query => {
        query.andWhere('foundation_id', userObj!.employee.foundation_id)
      })
      .if(roles.includes('super_admin') && foundationId, query => {
        query.andWhere('foundation_id', foundationId)
      })
      .withCount('students')

    const formattedClasses = classes.map(kelas => ({
      kelas: kelas.name,
      value: parseInt(kelas.$extras.students_count)
    }))

    const totalStudents = classes.reduce((sum, next) => {
      const count = parseInt(next.$extras.students_count, 10);
      return sum + count;
    }, 0);

    return {
      chart: formattedClasses,
      totalStudent: totalStudents
    }
  }

  private async getTeacherInfoByUser(userObj) {
    // NOTE: await di pemanggilan RolesHelper dihapus, klo ngebug coba cek lagi
    const roles = RolesHelper(userObj)

    // jika bukan guru, return objek kosong
    if (roles.includes('super_admin') || roles.includes('admin_foundation')) return {}

    // TODO: klo ini fail, masuk unhandled exception
    const teacher = await Teacher.query().where('employee_id', userObj.employee.id)
      .preload('teaching', t => {
        t.select("id", "class_id", "subject_id")
          .preload('subject', s => s.select('name'))
          .preload('class', c => c.select('name'))
      })
      .preload('employee', e => e.select('id').preload('homeroomTeacher', ht => {
        ht.select('name')
      }))
      .first()

    if (teacher === null) return {}

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
