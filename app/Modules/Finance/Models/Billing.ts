import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { BillingStatus, BillingType } from '../lib/enums';
import Student from 'App/Modules/Academic/Models/Student';
import MasterBilling from './MasterBilling';

export default class Billing extends BaseModel {
  public static table = 'finance.billings';

  @column({ isPrimary: true })
  public id: string

  @column()
  public studentId: string | null

  @column()
  public masterBillingId: string | null

  @column()
  public name: string

  @column()
  public amount: string

  @column()
  public description: string | null

  @column()
  public status: BillingStatus

  @column()
  public type: BillingType

  @belongsTo(() => Student)
  public student: BelongsTo<typeof Student>

  @belongsTo(() => MasterBilling)
  public masterBilling: BelongsTo<typeof MasterBilling>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
