import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { TransactionStatus } from '../lib/enums';
import { v4 as uuidv4 } from 'uuid'
import Student from 'App/Modules/Academic/Models/Student';

let newId = ""

export default class TransactionDocument extends BaseModel {
  public static table = 'finance.transaction_documents';

  @column({ isPrimary: true })
  public id: string

  @column()
  studentId: string

  @column()
  file: string

  @column()
  amount: string

  @column()
  description: string

  @column()
  adminNote: string | null

  @column()
  status: TransactionStatus

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Student)
  public student: BelongsTo<typeof Student>

  @beforeCreate()
  public static assignUuid(transaction: TransactionDocument) {
    newId = uuidv4()
    transaction.id = newId
  }

  @afterCreate()
  public static setNewId(transaction: TransactionDocument) {
    transaction.id = newId
  }
}
