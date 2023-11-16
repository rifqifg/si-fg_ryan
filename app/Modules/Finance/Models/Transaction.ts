import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, ManyToMany, afterCreate, beforeCreate, beforeDelete, belongsTo, column, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import { TransactionMethods, TransactionStatus, TransactionTypes } from '../lib/enums';
import { v4 as uuidv4 } from 'uuid'
import Billing from './Billing';
import Employee from 'App/Models/Employee';
import TransactionDocument from './TransactionDocument';
import Revenue from './Revenue';
import Account from './Account';

let newId = ""

export default class Transaction extends BaseModel {
  public static table = 'finance.transactions';

  public serializeExtras() {
    return {
      pivot_amount: this.$extras.pivot_amount,
    }
  }

  @column({ isPrimary: true })
  public id: string

  @column()
  public coaId: string | null

  @column()
  public revenueId: string | null

  @column()
  public documentId: string | null

  @column()
  public accountId: string | null

  @column()
  public tellerId: string | null

  @column()
  public amount: number

  @column()
  public method: TransactionMethods | null

  @column()
  public type: TransactionTypes | null

  @column()
  public status: TransactionStatus | null

  @column()
  public description: string | null

  @belongsTo(() => TransactionDocument)
  public document: BelongsTo<typeof TransactionDocument>

  @belongsTo(() => Employee, {
    foreignKey: 'tellerId',
    localKey: 'id'
  })
  public teller: BelongsTo<typeof Employee>

  @belongsTo(() => Revenue)
  public revenue: BelongsTo<typeof Revenue>

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
  
  @beforeCreate()
  public static async updateRevenueAmount(transaction: Transaction) {
    if (transaction.revenueId) {
      const revenue = await Revenue.findOrFail(transaction.revenueId)
      const newCurrentBalance = revenue.currentBalance - transaction.amount

      await revenue.merge({currentBalance: newCurrentBalance}).save()
    }
  }

  @beforeCreate()
  public static async updateAccountBalance(transaction: Transaction) {
    const account = await Account.findOrFail(transaction.accountId)
    const newBalance = account.balance - transaction.amount

    await account.merge({balance: newBalance}).save()
  }

  @beforeDelete()
  public static async increaseRevenueAmount(transaction: Transaction) {
    if (transaction.revenueId) {
      const revenue = await Revenue.findOrFail(transaction.revenueId)
      const newCurrentBalance = revenue.currentBalance + transaction.amount

      await revenue.merge({currentBalance: newCurrentBalance}).save()
    }
  }

  @beforeDelete()
  public static async increaseAccountBalance(transaction: Transaction) {
    const account = await Account.findOrFail(transaction.accountId)
    const newBalance = account.balance + transaction.amount

    await account.merge({balance: newBalance}).save()
  }

  @afterCreate()
  public static setNewId(transaction: Transaction) {
    transaction.id = newId
  }
}
