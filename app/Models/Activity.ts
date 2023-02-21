import { DateTime } from 'luxon'
import { afterCreate, BaseModel, beforeCreate, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import Presence from './Presence'
import Division from './Division'
let newId = ""
export default class Activity extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public timeInStart: string

  @column()
  public timeLateStart: string

  @column()
  public timeInEnd: string

  @column()
  public timeOutStart: string

  @column()
  public timeOutEnd: string

  @column()
  public maxWorkingDuration: string

  @column()
  public type: string

  @column()
  public scheduleActive: boolean

  @column()
  public days: string

  @column({ serializeAs: null })
  public owner: string

  @column()
  public divisionId: string

  @belongsTo(() => Division)
  public division: BelongsTo<typeof Division>

  @hasMany(() => Presence)
  public presence: HasMany<typeof Presence>

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(acrivity: Activity) {
    newId = uuidv4()
    acrivity.id = newId
  }

  @afterCreate()
  public static setNewId(acrivity: Activity) {
    acrivity.id = newId
  }
}
