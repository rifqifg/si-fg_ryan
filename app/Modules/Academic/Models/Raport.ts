import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Class from './Class';
import AcademicYear from './AcademicYear';
import Semester from './Semester';

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
  public academicYearId: number

  @column()
  public classId: string

  @belongsTo(() => AcademicYear)
  public academicYear: BelongsTo<typeof AcademicYear>

  @belongsTo(() => Semester)
  public semester: BelongsTo<typeof Semester>

  @belongsTo(() => Class)
  public class: BelongsTo<typeof Class>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
