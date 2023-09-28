import { DateTime } from 'luxon'
import { BaseModel, HasMany, afterCreate, beforeCreate, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import MonthlyReportEmployee from './MonthlyReportEmployee'
import { v4 as uuidv4 } from 'uuid'
let newId = ""

export default class MonthlyReport extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column.date()
  public fromDate: DateTime

  @column.date()
  public toDate: DateTime

  @hasMany(() => MonthlyReportEmployee)
  public monthlyReportEmployees: HasMany<typeof MonthlyReportEmployee>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(monthlyReport: MonthlyReport) {
    newId = uuidv4()
    monthlyReport.id = newId
  }

  @afterCreate()
  public static setNewId(monthlyReport: MonthlyReport) {
    monthlyReport.id = newId
  }
}
