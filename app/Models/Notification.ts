import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
let newId = ""

export default class Notification extends BaseModel {
  public serializeExtras() {
    return {
      time_elapsed: this.$extras.time_elapsed,
    }
  }

  @column({ isPrimary: true })
  public id: string

  @column()
  public title: string

  @column()
  public description: string

  @column.dateTime()
  public date: DateTime

  @column()
  public read: boolean

  @column()
  public type: string

  @column()
  public userId: string

  @belongsTo(() => Notification)
  public user: BelongsTo<typeof Notification>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(notif: Notification) {
    newId = uuidv4()
    notif.id = newId
  }

  @afterCreate()
  public static setNewId(notif: Notification) {
    notif.id = newId
  }
}
