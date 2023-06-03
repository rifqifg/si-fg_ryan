import { DateTime } from 'luxon'
import { BaseModel, afterCreate, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'

let newId = ""

export default class PPDBSetting extends BaseModel {
  public static table = 'ppdb.ppdb_setting';

  @column({ isPrimary: true })
  public id: string

  @column()
  public guideContent: object

  @column()
  public active: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(ppdbSettings: PPDBSetting) {
    if (!(ppdbSettings.id)) {
      newId = uuidv4()
      ppdbSettings.id = newId
    }
  }

  @afterCreate()
  public static setNewId(ppdbSettings: PPDBSetting) {
    ppdbSettings.id = newId
  }
}
