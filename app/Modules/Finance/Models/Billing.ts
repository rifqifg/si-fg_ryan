import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, ManyToMany, afterCreate, beforeCreate, belongsTo, column, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import { BillingStatus, BillingType } from '../lib/enums';
import MasterBilling from './MasterBilling';
import Account from './Account';
import { v4 as uuidv4 } from 'uuid'
import Transaction from './Transaction';

let newId = ""

export default class Billing extends BaseModel {
  public static table = 'finance.billings';

  public serializeExtras() {
    return {
      pivot_amount: this.$extras.pivot_amount,
      remaining_amount: this.$extras.remaining_amount,
    }
  }

  @column({ isPrimary: true })
  public id: string

  @column()
  public accountId: string | null

  @column()
  public masterBillingId: string | null

  @column()
  public name: string

  @column()
  public amount: number

  @column()
  public description: string | null

  @column()
  public status: BillingStatus

  @column()
  public type: BillingType | null

  // @column()
  // public remainingAmount: number

  @belongsTo(() => Account)
  public account: BelongsTo<typeof Account>

  @belongsTo(() => MasterBilling)
  public masterBilling: BelongsTo<typeof MasterBilling>

  @manyToMany(() => Transaction, {
    pivotTable: 'finance.transaction_billings',
    pivotColumns: ['amount'],
    pivotTimestamps: true
  })
  public transactions: ManyToMany<typeof Transaction>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(billing: Billing) {
    newId = uuidv4()
    billing.id = newId
  }

  @afterCreate()
  public static setNewId(billing: Billing) {
    billing.id = newId
  }
}
