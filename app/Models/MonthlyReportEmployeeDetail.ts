import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import MonthlyReportEmployee from './MonthlyReportEmployee'
import Activity from './Activity'
import Leave from './Leave'
import { v4 as uuidv4 } from 'uuid'
let newId = ""

export default class MonthlyReportEmployeeDetail extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public skor: number

  @column()
  public note: string | null

  @column()
  public monthlyReportEmployeeId: string

  @belongsTo(() => MonthlyReportEmployee)
  public monthlyReportEmployee: BelongsTo<typeof MonthlyReportEmployee>

  @column()
  public activityId: string | null

  @belongsTo(() => Activity)
  public activity: BelongsTo<typeof Activity>

  @column()
  public leaveId: string | null

  @belongsTo(() => Leave)
  public leave: BelongsTo<typeof Leave>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(monthlyReportEmployeeDetail: MonthlyReportEmployeeDetail) {
    newId = uuidv4()
    monthlyReportEmployeeDetail.id = newId
  }

  @afterCreate()
  public static setNewId(monthlyReportEmployeeDetail: MonthlyReportEmployeeDetail) {
    monthlyReportEmployeeDetail.id = newId
  }
}
