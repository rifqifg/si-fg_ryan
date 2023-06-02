import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import AcademicYear from './AcademicYear';

let newId = ""

export default class PPDBBatch extends BaseModel {
  public static table = 'ppdb.ppdb_batches';

  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public academicYear: string

  @belongsTo(() => AcademicYear, {
    foreignKey: 'academicYear',
    localKey: 'year',
  })
  public academicYears: BelongsTo<typeof AcademicYear>

  @column()
  public description: string | null

  @column()
  public active: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(ppdbBatch: PPDBBatch) {
    if (!(ppdbBatch.id)) {
      newId = uuidv4()
      ppdbBatch.id = newId
    }
  }

  @afterCreate()
  public static setNewId(ppdbBatch: PPDBBatch) {
    ppdbBatch.id = newId
  }
}
