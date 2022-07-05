import { DateTime } from 'luxon'
import { afterCreate, BaseModel, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
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
  public timeInEnd: string

  @column()
  public timeOutStart: string

  @column()
  public timeOutEnd: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
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
