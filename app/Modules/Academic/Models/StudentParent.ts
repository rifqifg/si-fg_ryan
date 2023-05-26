import { DateTime } from 'luxon'
import { afterCreate, BaseModel, beforeCreate, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import { ParentEducation, ParentRelationship } from '../lib/enums';
import Student from './Student';
let newId = ""

export default class StudentParent extends BaseModel {
  public static table = 'academic.student_parents';

  @column({ isPrimary: true })
  public id: string

  @column()
  public studentId: string | null

  @belongsTo(() => Student)
  public student: BelongsTo<typeof Student>

  @column()
  public relationshipWStudent: ParentRelationship | null

  @column()
  public nik: string | null

  @column()
  public name: string | null

  @column.date()
  public birthDate: DateTime | null

  @column()
  public education: ParentEducation | null

  @column()
  public occupation: string | null

  @column()
  public minSalary: string | null

  @column()
  public maxSalary: string | null

  @column()
  public phoneNumber: string | null

  @column()
  public email: string | null

  @column()
  public address: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime | null

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime | null

  @beforeCreate()
  public static assignUuid(studentParent: StudentParent) {
    if (!(studentParent.id)) {
      newId = uuidv4()
      studentParent.id = newId
    }
  }

  @afterCreate()
  public static setNewId(studentParent: StudentParent) {
    studentParent.id = newId
  }
}
