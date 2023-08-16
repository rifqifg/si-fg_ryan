import { DateTime } from 'luxon'
import { BaseModel, afterCreate, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import { BillingPeriod, BillingType } from '../lib/enums';
import { v4 as uuidv4 } from 'uuid'

let newId = ""

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

  @column.dateTime()
  public dueDate: DateTime

  @column()
  public description: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(masterBilling: MasterBilling) {
    newId = uuidv4()
    masterBilling.id = newId
  }

  @afterCreate()
  public static setNewId(masterBilling: MasterBilling) {
    masterBilling.id = newId
  }
}
