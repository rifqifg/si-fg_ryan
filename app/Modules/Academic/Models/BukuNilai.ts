import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import ProgramSemesterDetail from './ProgramSemesterDetail'
import Student from './Student'
import Teacher from './Teacher'
import Subject from './Subject'

export default class BukuNilai extends BaseModel {
  public static table = 'academic.buku_nilais'

  @column({ isPrimary: true })
  public id: string

  @column()
  public programSemesterDetailId: string

  @column()
  public studentId: string

  @column()
  public teacherId: string

  @column()
  public subjectId: string

  @column()
  public nilai: number

  @column()
  public type: string

  @belongsTo(() => ProgramSemesterDetail)
  public programSemesterDetail: BelongsTo<typeof ProgramSemesterDetail>

  @belongsTo(() => Student)
  public students: BelongsTo<typeof Student>

  @belongsTo(() => Teacher)
  public teachers: BelongsTo<typeof Teacher>

  @belongsTo(() => Subject)
  public mapels: BelongsTo<typeof Subject>

  @beforeCreate()
  public static assignUuid(bn: BukuNilai) {
    bn.id = uuidv4()
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
