import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import StudentCandidate from './StudentCandidate';
import PPDBBatch from './PPDBBatch';
import { InterviewTopic, ScSppChoice } from '../lib/enums';
import { ClassMajor, StudentProgram } from 'App/Modules/Academic/lib/enums';

let newId = ""

export default class PpdbInterview extends BaseModel {
  public static table = 'ppdb.ppdb_interviews';

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
  public batchId: string

  @belongsTo(() => PPDBBatch, {
    foreignKey: 'batchId',
    localKey: 'id'
  })
  public batch: BelongsTo<typeof PPDBBatch>

  @column()
  public topic: InterviewTopic

  @column()
  public interviewerName: string | null

  @column()
  public programResult: StudentProgram | null

  @column()
  public majorResult: ClassMajor | null

  @column()
  public sppResult: ScSppChoice | null

  @column()
  public note: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(ppdbInterview: PpdbInterview) {
    newId = uuidv4()
    ppdbInterview.id = newId
  }

  @afterCreate()
  public static setNewId(ppdbInterview: PpdbInterview) {
    ppdbInterview.id = newId
  }
}