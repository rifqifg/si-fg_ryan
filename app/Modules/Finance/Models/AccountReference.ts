import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { BillingType } from '../lib/enums';
import Account from './Account';
import { v4 as uuidv4 } from 'uuid'

let newId = ""
export default class AccountReference extends BaseModel {
  public static table = 'finance.account_references';

  @column({ isPrimary: true })
  public id: string

  @column()
  accountId: string

  @column()
  public amount: number

  @column()
  public type: BillingType

  @belongsTo(() => Account)
  public account: BelongsTo<typeof Account>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static setNewId(accountReference: AccountReference) {
    newId = uuidv4()
    accountReference.id = newId
  }
}
