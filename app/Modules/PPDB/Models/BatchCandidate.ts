import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import StudentCandidate from './StudentCandidate';
import PPDBBatch from './PPDBBatch';

let newId = ""

export default class BatchCandidate extends BaseModel {
  public static table = 'ppdb.batch_candidates';

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
