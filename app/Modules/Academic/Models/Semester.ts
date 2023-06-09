import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Semester extends BaseModel {
  public static table = 'academic.semesters';

  @column({ isPrimary: true })
  public id: string

  @column()
  public semesterName: string

  @column()
  public isActive: boolean

  @column()
  public description: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
