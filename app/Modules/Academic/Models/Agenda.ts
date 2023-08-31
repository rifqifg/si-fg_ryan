import { DateTime } from "luxon";
import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class Agenda extends BaseModel {
  @column({ isPrimary: true })
  public id: string;

  @column()
  public nama: string;

  @column()
  public countPresence: boolean

  @column()
  public description: string

  @column()
  public type: string

  @column()
  public userId: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
