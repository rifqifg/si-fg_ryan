import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, HasMany, afterCreate, beforeCreate, beforeDelete, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import { RevenueStatus } from '../lib/enums';
import Account from './Account';
import Transaction from './Transaction';

let newId = ""

export default class Revenue extends BaseModel {
  public static table = 'finance.revenues';

  // public serializeExtras() {
  //   return {
  //     current_balance: this.$extras.current_balance,
  //   }
  // }

  @hasMany(() => Transaction)
  public transactions: HasMany<typeof Transaction>

  @column({ isPrimary: true })
  public id: string

  @column()
  refNo: string

  @column()
  fromAccount: string

  @column()
  amount: number

  @column()
  currentBalance: number

  @column()
  invoiceNumber: string

  @column()
  invoiceAmount: number

  @column.dateTime()
  timeReceived: DateTime

  @column()
  status: RevenueStatus

  @belongsTo(() => Account, {
    foreignKey: 'fromAccount',
    localKey: 'id'
  })
  public account: BelongsTo<typeof Account>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static async assignUuid(revenue: Revenue) {
    newId = uuidv4()
    revenue.id = newId

    const account = await Account.findByOrFail('id', revenue.fromAccount)
    const newAccountBalance = account.balance + revenue.amount

    await account.merge({ balance: newAccountBalance }).save()
  }

  @beforeDelete()
  public static async reduceAccountBalance(revenue: Revenue) {
    const account = await Account.findByOrFail('id', revenue.fromAccount)
    const newAccountBalance = account.balance - revenue.amount

    await account.merge({ balance: newAccountBalance }).save()
  }

  @afterCreate()
  public static setNewId(revenue: Revenue) {
    revenue.id = newId
  }
}
