import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Predikat extends BaseModel {
  public static table = 'academic.predikats'

  @column({ isPrimary: true })
  public id: string

  @column()
  public scoreMinimum: number;

  @column()
  public scoreMaximum: number;

  @column()
  public scoreSikap: string

  @column()
  public type: string

  @column()
  public category: string

  @column()
  public description: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
