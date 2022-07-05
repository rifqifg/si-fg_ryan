import { DateTime } from 'luxon'
import { afterCreate, BaseModel, beforeCreate, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import Activity from './Activity'
import Employee from './Employee'

let newId = ""
export default class Presence extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public activityId: string

  @belongsTo(() => Activity)
  public activity: BelongsTo<typeof Activity>

  @column()
  public employeeId: string

  @belongsTo(() => Employee)
  public employee: BelongsTo<typeof Employee>

  @column.dateTime()
  public timeIn: DateTime

  @column.dateTime()
  public timeOut: DateTime

  @column()
  public description: string

  @beforeCreate()
  public static assignUuid(presence: Presence) {
    newId = uuidv4()
    presence.id = newId
  }

  @afterCreate()
  public static setNewId(presence: Presence) {
    presence.id = newId
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
