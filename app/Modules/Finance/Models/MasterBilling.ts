import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { BillingPeriod, BillingType } from '../lib/enums';

export default class MasterBilling extends BaseModel {
  public static table = 'finance.master_billings';

  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public period: BillingPeriod

  @column()
  public amount: string

  @column()
  public type: BillingType

  @column.date()
  public dueDate: DateTime

  @column()
  public description: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
