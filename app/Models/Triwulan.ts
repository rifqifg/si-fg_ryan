import { DateTime } from 'luxon'
import { BaseModel, afterCreate, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from "uuid";
let newId = "";

export default class Triwulan extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column.date()
  public from_date: DateTime

  @column.date()
  public to_date: DateTime

  @column()
  public description: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(triwulan: Triwulan) {
    newId = uuidv4();
    triwulan.id = newId;
  }

  @afterCreate()
  public static setNewId(triwulan: Triwulan) {
    triwulan.id = newId;
  }
}
