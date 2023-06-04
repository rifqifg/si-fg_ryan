import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import StudentCandidate from './StudentCandidate';
import PPDBBatch from './PPDBBatch';
import { ScSppChoice } from '../lib/enums';
import { ClassMajor, StudentProgram } from 'App/Modules/Academic/lib/enums';
import EntranceExamSchedule from './EntranceExamSchedule';

let newId = ""

export default class BatchCandidate extends BaseModel {
  public static table = 'ppdb.batch_candidates';

  @column({ isPrimary: true })
  public id: string

  @column()
  public candidateId: string

  @belongsTo(() => StudentCandidate, {
    foreignKey: 'candidate_id',
    localKey: 'id'
  })
  public studentCandidates: BelongsTo<typeof StudentCandidate>

  @column()
  public batchId: string | null

  @belongsTo(() => PPDBBatch, {
    foreignKey: 'batch_id',
    localKey: 'id'
  })
  public batches: BelongsTo<typeof PPDBBatch>

  @column()
  public sppChoice: ScSppChoice | null

  @column()
  public programChoice: StudentProgram | null

  @column()
  public majorChoice: ClassMajor | null

  @column()
  public testScheduleChoice

  @belongsTo(() => EntranceExamSchedule, {
    foreignKey: 'test_schedule_choice',
    localKey: 'id'
  })
  public entranceExamSchedules: BelongsTo<typeof EntranceExamSchedule>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(batchCandidate: BatchCandidate) {
    newId = uuidv4()
    batchCandidate.id = newId
  }

  @afterCreate()
  public static setNewId(batchCandidate: BatchCandidate) {
    batchCandidate.id = newId
  }
}
