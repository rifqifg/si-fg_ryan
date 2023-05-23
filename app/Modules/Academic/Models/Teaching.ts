import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import Teacher from './Teacher';
import Class from './Class';
import Subject from './Subject';
let newId = ""

export default class Teaching extends BaseModel {
  public static table = 'academic.teachings';

  @column({ isPrimary: true })
  public id: string

  @column()
  public teacherId: string

  @belongsTo(() => Teacher)
  public teacher: BelongsTo<typeof Teacher>

  @column()
  public classId: string

  @belongsTo(() => Class)
  public class: BelongsTo<typeof Class>

  @column()
  public subjectId: string

  @belongsTo(() => Subject)
  public subject: BelongsTo<typeof Subject>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(teaching: Teaching) {
    newId = uuidv4()
    teaching.id = newId
  }

  @afterCreate()
  public static setNewId(teaching: Teaching) {
    teaching.id = newId
  }
}
