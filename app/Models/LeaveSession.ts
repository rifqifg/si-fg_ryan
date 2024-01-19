import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Employee from './Employee'
import { StatusLeaves } from 'App/lib/enum'
import { v4 as uuidv4 } from 'uuid'
import Unit from './Unit'
let newId = ""

export default class LeaveSession extends BaseModel {
  public serializeExtras() {
    return {
      count_sessions: this.$extras.count_sessions,
      notes: this.$extras.notes,
    }
  }

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

  @column()
  public unitId: string

  @belongsTo(() => Unit)
  public unit: BelongsTo<typeof Unit>

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
