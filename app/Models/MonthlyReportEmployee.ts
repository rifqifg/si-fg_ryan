import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, HasMany, afterCreate, beforeCreate, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Employee from './Employee'
import MonthlyReportEmployeeDetail from './MonthlyReportEmployeeDetail'
import { v4 as uuidv4 } from 'uuid'
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
  public static setNewId(monthlyReportEmployee: MonthlyReportEmployee) {
    monthlyReportEmployee.id = newId
  }
}
