import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Student from './Student'

export default class StudentRaport extends BaseModel {
  public static table = "academic.student_raports";
  
  @column({ isPrimary: true })
  public id: string

  @column()
  public studentId: string

  @column()
  public raportId: string

  @belongsTo(() => Student)
  public students: BelongsTo<typeof Student>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
