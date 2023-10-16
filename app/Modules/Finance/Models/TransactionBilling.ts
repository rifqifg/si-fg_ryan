import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import Transaction from './Transaction'
import Billing from './Billing'

let newId = ""

export default class TransactionBilling extends BaseModel {
  public static table = 'finance.transaction_billings';

  @column({ isPrimary: true })
  public id: string

  @column()
  public transactionId: string

  @column()
  public billingId: string

  @column()
  public amount: number

  @belongsTo(() => Transaction)
  public transaction: BelongsTo<typeof Transaction>

  @belongsTo(() => Billing)
  public billing: BelongsTo<typeof Billing>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(transactionBilling: TransactionBilling) {
    newId = uuidv4()
    transactionBilling.id = newId
  }

  @afterCreate()
  public static setNewId(transactionBilling: TransactionBilling) {
    transactionBilling.id = newId
  }
}
