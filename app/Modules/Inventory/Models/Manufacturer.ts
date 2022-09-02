import { DateTime } from 'luxon'
import { afterCreate, BaseModel, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
let newId = ""

export default class Manufacturer extends BaseModel {
  public static table = 'inventory.manufacturers';

  @column({ isPrimary: true })
  public id: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(manufacturer: Manufacturer) {
    newId = uuidv4()
    manufacturer.id = newId
  }

  @afterCreate()
  public static setNewId(manufacturer: Manufacturer) {
    manufacturer.id = newId
  }
}
