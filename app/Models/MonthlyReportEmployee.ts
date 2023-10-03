import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, HasMany, afterCreate, beforeCreate, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Employee from './Employee'
import MonthlyReportEmployeeDetail from './MonthlyReportEmployeeDetail'
import { v4 as uuidv4 } from 'uuid'
import { HttpContext } from '@adonisjs/core/build/standalone'
import Presence from './Presence'
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

  @belongsTo(() => Employee)
  public monthlyReport: BelongsTo<typeof Employee>

  @hasMany(() => MonthlyReportEmployeeDetail)
  public monthlyReportEmployeesDetails: HasMany<typeof MonthlyReportEmployeeDetail>

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
