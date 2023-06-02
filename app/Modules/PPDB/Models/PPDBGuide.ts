import { DateTime } from 'luxon'
import { BaseModel, afterCreate, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'

let newId = ""

export default class PPDBGuide extends BaseModel {
  public static table = 'ppdb.ppdb_guide';

  @column({ isPrimary: true })
  public id: string

  @column()
  public content: object

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(ppdbGuide: PPDBGuide) {
    if (!(ppdbGuide.id)) {
      newId = uuidv4()
      ppdbGuide.id = newId
    }
  }

  @afterCreate()
  public static setNewId(ppdbGuide: PPDBGuide) {
    ppdbGuide.id = newId
  }
}
