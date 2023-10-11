import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Employee from './Employee'
import { StatusLeaves } from 'App/lib/enum'
import { v4 as uuidv4 } from 'uuid'
let newId = ""

export default class LeaveSession extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public status: StatusLeaves

  @column()
  public sessions: string[]

  @column.date()
  public date: DateTime

  @column()
  public note: string

  @column()
  public employeeId: string

  @belongsTo(() => Employee)
  public employee: BelongsTo<typeof Employee>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(LeaveSession: LeaveSession) {
    newId = uuidv4()
    LeaveSession.id = newId
  }

  @afterCreate()
  public static setNewId(LeaveSession: LeaveSession) {
    LeaveSession.id = newId
  }
}
