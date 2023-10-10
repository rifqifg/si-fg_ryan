import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import { RevenueStatus } from '../lib/enums';
import Account from './Account';

let newId = ""

export default class Revenue extends BaseModel {
  public static table = 'finance.revenues';

  @column({ isPrimary: true })
  public id: string

  @column()
  refNo: string

  @column()
  fromAccount: string

  @column()
  amount: number

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
  public static assignUuid(revenue: Revenue) {
    newId = uuidv4()
    revenue.id = newId
  }

  @afterCreate()
  public static setNewId(revenue: Revenue) {
    revenue.id = newId
  }
}
