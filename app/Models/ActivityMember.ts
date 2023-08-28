import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
let newId = ""
import { RoleActivityMember } from 'App/lib/enum'
import Activity from './Activity'
import Employee from './Employee'

export default class ActivityMember extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public role: RoleActivityMember

  @column()
  public activityId: string

  @belongsTo(() => Activity)
  public activity: BelongsTo<typeof Activity>

  @column()
  public employeeId: string

  @belongsTo(() => Employee)
  public employee: BelongsTo<typeof Employee>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(ActivityMember: ActivityMember) {
    newId = uuidv4()
    ActivityMember.id = newId
  }

  @afterCreate()
  public static setNewId(ActivityMember: ActivityMember) {
    ActivityMember.id = newId
  }
}
