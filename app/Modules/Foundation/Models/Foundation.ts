import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from "uuid";
let newId = "";

export default class Foundation extends BaseModel {
  public static table = 'foundation.foundations';

  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public description: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(foundation: Foundation) {
    if (!foundation.id) {
      newId = uuidv4();
      foundation.id = newId;
    }
  }
}
