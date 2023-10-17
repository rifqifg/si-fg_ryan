import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, HasMany, afterCreate, beforeCreate, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Employee from './Employee'
import MonthlyReportEmployeeDetail from './MonthlyReportEmployeeDetail'
import { v4 as uuidv4 } from 'uuid'
import { HttpContext } from '@adonisjs/core/build/standalone'
import Presence from './Presence'
import MonthlyReport from './MonthlyReport'
import Leave from './Leave'
import Database from '@ioc:Adonis/Lucid/Database'
import LeaveSession from './LeaveSession'
import TeacherAttendance from 'App/Modules/Academic/Models/TeacherAttendance'
let newId = ""

export default class MonthlyReportEmployee extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public achievement: string | null

  @column()
  public indisipliner: string | null

  @column()
  public suggestions_and_improvements: string | null

  @column()
  public employeeId: string

  @belongsTo(() => Employee)
  public employee: BelongsTo<typeof Employee>

  @column()
  public monthlyReportId: string

  @belongsTo(() => MonthlyReport)
  public monthlyReport: BelongsTo<typeof MonthlyReport>

  @hasMany(() => MonthlyReportEmployeeDetail)
  public monthlyReportEmployeesFixedTime: HasMany<typeof MonthlyReportEmployeeDetail>

  @hasMany(() => MonthlyReportEmployeeDetail)
  public monthlyReportEmployeesNotFixedTime: HasMany<typeof MonthlyReportEmployeeDetail>

  @hasMany(() => MonthlyReportEmployeeDetail)
  public monthlyReportEmployeesLeave: HasMany<typeof MonthlyReportEmployeeDetail>

  @hasMany(() => MonthlyReportEmployeeDetail)
  public monthlyReportEmployeesLeaveSession: HasMany<typeof MonthlyReportEmployeeDetail>

  @hasMany(() => MonthlyReportEmployeeDetail)
  public monthlyReportEmployeesTeaching: HasMany<typeof MonthlyReportEmployeeDetail>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(monthlyReportEmployee: MonthlyReportEmployee) {
    newId = uuidv4()
    monthlyReportEmployee.id = newId
  }

  @afterCreate()
  public static async insertMonthlyReportEmployeeDetail(monthlyReportEmployee: MonthlyReportEmployee) {
    const { request } = HttpContext.get()!
    const { fromDate, toDate }: any = JSON.parse(request.raw()!)
    // const monthlyReportId = monthlyReportEmployee.monthlyReportId
    // const employeeId = monthlyReportEmployee.employeeId

    // Menghitung Presensi employee Aktifitas yang tetap
    const presenceEmployeeFixedTime = await countPresenceEMployeeFixedTime(monthlyReportEmployee, fromDate, toDate)
    if (presenceEmployeeFixedTime) {
      await MonthlyReportEmployeeDetail.create({
        skor: presenceEmployeeFixedTime.presence_count,
        activityId: presenceEmployeeFixedTime.activity_id,
        monthlyReportEmployeeId: monthlyReportEmployee.id
      })
    }

    // Menghitung Presensi employee Aktifitas yang tidak tetap
    const presenceEmployeeNotFixedTime = await countPresenceEMployeeNotFixedTime(monthlyReportEmployee, fromDate, toDate)
    if (presenceEmployeeNotFixedTime.length > 0) {
      presenceEmployeeNotFixedTime.map(async value => {
        await MonthlyReportEmployeeDetail.create({
          skor: value.presence_count,
          activityId: value.activity_id,
          monthlyReportEmployeeId: monthlyReportEmployee.id
        })
      })
    }

    //menghitung sisa jumlah cuti
    const leaveEmployee = await countLeaveEmloyees(monthlyReportEmployee, fromDate)
    if (leaveEmployee) {
      await MonthlyReportEmployeeDetail.create({
        skor: leaveEmployee.sisa_jatah_cuti,
        isLeave: true,
        monthlyReportEmployeeId: monthlyReportEmployee.id,
        note: leaveEmployee.reasons
      })
    }

    //menghitung sisa jumlah cuti
    const leaveSessionEmployee = await countLeaveSessionEmployee(monthlyReportEmployee, fromDate, toDate)
    if (leaveSessionEmployee) {
      await MonthlyReportEmployeeDetail.create({
        skor: leaveSessionEmployee.count_sessions,
        isLeaveSession: true,
        monthlyReportEmployeeId: monthlyReportEmployee.id,
        note: leaveSessionEmployee.notes
      })
    }

    const teachingEmployee = await countTeachingEmployee(monthlyReportEmployee, fromDate, toDate)
    if (teachingEmployee) {
      await MonthlyReportEmployeeDetail.create({
        skor: teachingEmployee.teach,
        isTeaching: true,
        monthlyReportEmployeeId: monthlyReportEmployee.id,
      })
    }
  }
}

const countPresenceEMployeeFixedTime = async (monthlyReportEmployee, fromDate, toDate) => {
  // mengambil presensi empoyee
  //TODO: kalo employee nya masuk di aktifitas KBM dan Kesantrian apakah harus di jumlahkan ?
  const presenceEmployee = await Presence.query()
    .select('activity_id')
    .whereBetween("time_in", [fromDate + ' 00:00:00', toDate + ' 23:59:59'])
    .andWhere('employee_id', monthlyReportEmployee.employeeId)
    .andWhereHas('activity', ac => ac.where('activity_type', 'fixed_time').andWhere('assessment', true))
    .count('*', 'presence_count')
    // .preload('activity', ac => ac.select('id', 'name'))
    .groupBy('activity_id')

  const dataPresenceEmployeeObject = JSON.parse(JSON.stringify(presenceEmployee))

  return dataPresenceEmployeeObject[0]
}

const countPresenceEMployeeNotFixedTime = async (monthlyReportEmployee, fromDate, toDate) => {
  // mengambil presensi empoyee waktu tidak tetap
  const presenceEmployee = await Presence.query()
    .select('activity_id')
    .whereBetween("created_at", [fromDate + ' 00:00:00', toDate + ' 23:59:59'])
    .andWhere('employee_id', monthlyReportEmployee.employeeId)
    .andWhereHas('activity', ac => ac.where('activity_type', 'not_fixed_time').andWhere('assessment', true))
    .count('*', 'presence_count')
    // .preload('activity', ac => ac.select('id', 'name'))
    .groupBy('activity_id')

  const dataPresenceEmployeeObject = JSON.parse(JSON.stringify(presenceEmployee))

  return dataPresenceEmployeeObject
}

const countLeaveEmloyees = async (monthlyReportEmployee, fromDate) => {
  const today = DateTime.fromISO(fromDate);
  // Tahun ajaran baru dimulai pada bulan Juli (bulan 7)
  const tahunAjaran = today.month >= 7 ? today.year : today.year - 1;
  const fromDateTahunAjaran = `${tahunAjaran}-07-01`
  const toDateTahunAjaran = `${tahunAjaran + 1}-06-30`

  const leaveEmployees = await Leave.query()
    .select('employee_id')
    .select(Database.raw(`(case when (select status from employees where id = '${monthlyReportEmployee.employeeId}') = 'FULL_TIME' then 6 else 3 end) - (sum(to_date - from_date + 1)) as sisa_jatah_cuti`))
    .select(Database.raw(`
      STRING_AGG(
        CASE
            WHEN from_date = to_date THEN TO_CHAR(to_date, 'DD Month') || ': ' || reason
            ELSE TO_CHAR(from_date, 'DD') || '-' || TO_CHAR(to_date, 'DD Month') || ': ' || reason
        END,
        ', '
      ) AS reasons
      `))
    .where('employee_id', monthlyReportEmployee.employeeId)
    .andWhere('leave_status', 'cuti')
    .andWhere('status', 'aprove')
    .andWhereBetween('to_date', [fromDateTahunAjaran, toDateTahunAjaran])
    .groupBy('employee_id')

  const dataLeaveEmployeeObject = JSON.parse(JSON.stringify(leaveEmployees))

  const employee = await Employee.query()
    .select('id')
    .select(Database.raw(`(case when status = 'FULL_TIME' then 6 else 3 end) as sisa_jatah_cuti`))
    .where('id', monthlyReportEmployee.employeeId)

  const dataEmployeeObject = JSON.parse(JSON.stringify(employee))

  return dataLeaveEmployeeObject.length != 0 ? dataLeaveEmployeeObject[0] : dataEmployeeObject[0]
}

const countLeaveSessionEmployee = async (monthlyReportEmployee, fromDate, toDate) => {
  //menghitung jumlah izin persesinya
  const leaveSessionEmployee = await LeaveSession.query()
    .select('employee_id')
    .select(Database.raw(`sum(ARRAY_LENGTH(sessions, 1)) as count_sessions`))
    .select(Database.raw(`string_agg(TO_CHAR(date, 'DD Month') || ' izin ' || array_to_string(sessions, ',') || ': ' ||note, ', ') as notes`))
    .where('employee_id', monthlyReportEmployee.employeeId)
    .andWhere('status', 'aprove')
    .andWhereBetween('date', [fromDate, toDate])
    .groupBy('employee_id')

  const leaveSessionEmployeeObject = JSON.parse(JSON.stringify(leaveSessionEmployee))

  return leaveSessionEmployeeObject[0]
}

const countTeachingEmployee = async (monthlyReportEmployee, fromDate, toDate) => {
  //menghitung jumlah mengajar
  const teachingEmployee = await TeacherAttendance.query()
    .whereBetween('date_in', [fromDate, toDate])
    .andWhereHas('teacher', t => t.whereHas('employee', e => e.where('id', monthlyReportEmployee.employeeId)))
    .andWhere('status', 'teach')
    .count('*', 'teach')

  const teachingEmployeeObject = JSON.parse(JSON.stringify(teachingEmployee))

  return teachingEmployeeObject[0]
}
