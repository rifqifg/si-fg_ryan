import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import PPDBBatch from './PPDBBatch'

let newId = ""

export default class EntranceExamSchedule extends BaseModel {
  public static table = 'ppdb.entrance_exam_schedules';

  @column({ isPrimary: true })
  public id: string

  @column()
  public batchId: string

  @belongsTo(() => PPDBBatch, {
    foreignKey: 'batchId',
    localKey: 'id'
  })
  public batches: BelongsTo<typeof PPDBBatch>

  @column()
  public maxCapacity: number

  @column()
  public currentQuota: number

  @column.dateTime()
  public timeStart: DateTime

  @column.dateTime()
  public timeEnd: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(entranceExamSchedule: EntranceExamSchedule) {
    if (!(entranceExamSchedule.id)) {
      newId = uuidv4()
      entranceExamSchedule.id = newId
    }
  }

  @afterCreate()
  public static setNewId(entranceExamSchedule: EntranceExamSchedule) {
    entranceExamSchedule.id = newId
  }
}
