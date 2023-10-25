import { DateTime } from 'luxon'
import { BaseModel, BelongsTo,  beforeCreate,  belongsTo, column} from '@ioc:Adonis/Lucid/Orm'
import {v4 as uuidV4} from 'uuid'
import Subject from './Subject'
import Student from './Student'

export default class SubjectMember extends BaseModel {
  public static table = 'academic.subject_members'
  
  @column({ isPrimary: true })
  public id: string

  @column()
  public subjectId: string

  @belongsTo(() => Subject)
  public subjects: BelongsTo<typeof Subject>

  @column()
  public studentId: string

  @belongsTo(() => Student)
  public students: BelongsTo<typeof Student>

  @column()
  public description: string | null

  @beforeCreate()
  public static asignUuid(subjectMember: SubjectMember) {
    subjectMember.id =  uuidV4()
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
