import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, ManyToMany, afterCreate, beforeCreate, belongsTo, column, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import { TransactionMethods, TransactionStatus, TransactionTypes } from '../lib/enums';
import { v4 as uuidv4 } from 'uuid'
import Billing from './Billing';
import Employee from 'App/Models/Employee';
import TransactionDocument from './TransactionDocument';

let newId = ""

export default class Transaction extends BaseModel {
  public static table = 'finance.transactions';

  @column({ isPrimary: true })
  public id: string

  @column()
  public coaId: string | null

  // @column()
  // public billingId: string | null

  @column()
  public documentId: string | null

  // @column()
  // public accountId: string | null

  @column()
  public tellerId: string | null

  @column()
  public amount: number

  @column()
  public method: TransactionMethods | null

  // @column.dateTime({ autoCreate: true })
  // public date: DateTime

  @column()
  public type: TransactionTypes | null

  @column()
  public status: TransactionStatus | null

  @column()
  public description: string | null

  // @belongsTo(() => Billing)
  // public billing: BelongsTo<typeof Billing>

  @belongsTo(() => TransactionDocument)
  public document: BelongsTo<typeof TransactionDocument>

  @belongsTo(() => Employee, {
    foreignKey: 'tellerId',
    localKey: 'id'
  })
  public teller: BelongsTo<typeof Employee>

  // @hasMany(() => TransactionBilling)
  // public transactionBillings: HasMany<typeof TransactionBilling>

  @manyToMany(() => Billing, {
    pivotTable: 'finance.transaction_billings',
    pivotColumns: ['amount'],
    pivotTimestamps: true
  })
  public billings: ManyToMany<typeof Billing>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(transaction: Transaction) {
    newId = uuidv4()
    transaction.id = newId
  }

  @afterCreate()
  public static setNewId(transaction: Transaction) {
    transaction.id = newId
  }
}
