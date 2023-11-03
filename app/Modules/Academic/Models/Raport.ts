import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Raport extends BaseModel {
  public static table = "academic.raports";

  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column.date()
  public fromDate: DateTime

  @column.date()
  public toDate: DateTime

  @column()
  public semesterId: string

  @column()
  public academicYearId: string

  @column()
  public classId: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
