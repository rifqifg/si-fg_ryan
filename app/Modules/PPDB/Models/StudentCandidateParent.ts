import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import StudentCandidate from './StudentCandidate';
import { ParentEducation, ParentRelationship } from 'App/Modules/Academic/lib/enums';

let newId = ""

export default class StudentCandidateParent extends BaseModel {
  public static table = 'ppdb.student_candidate_parents';

  @column({ isPrimary: true })
  public id: string

  @column()
  public candidateId: string

  @belongsTo(() => StudentCandidate, {
    foreignKey: 'candidateId',
    localKey: 'id'
  })
  public candidate: BelongsTo<typeof StudentCandidate>

  @column()
  public relationshipWStudent: ParentRelationship

  @column()
  public name: string

  @column()
  public phoneNumber: string | null

  @column()
  public nik: string

  @column()
  public education: ParentEducation | null

  @column()
  public occupation: string | null

  @column()
  public minSalary: string | null

  @column()
  public maxSalary: string | null

  @column()
  public email: string | null

  @column()
  public address: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(studentCandidateParent: StudentCandidateParent) {
    newId = uuidv4()
    studentCandidateParent.id = newId
  }

  @afterCreate()
  public static setNewId(studentCandidateParent: StudentCandidateParent) {
    studentCandidateParent.id = newId
  }
}
