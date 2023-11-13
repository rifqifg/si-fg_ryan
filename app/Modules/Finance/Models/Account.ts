import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, HasMany, afterCreate, beforeCreate, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Coa from './Coa';
import Student from 'App/Modules/Academic/Models/Student';
import Employee from 'App/Models/Employee';
import { v4 as uuidv4 } from 'uuid'
import Billing from './Billing';
import { BillingType } from '../lib/enums';

let newId = ""

export default class Account extends BaseModel {
  public static table = 'finance.accounts';

  public serializeExtras() {
    return {
      roles: this.$extras.roles,
    }
  }

  @column({ isPrimary: true })
  public id: string

  @column()
  public coaId: string | null

  @column()
  public studentId: string | null

  @column()
  public employeeId: string | null

  @column()
  public owner: string | null

  @column()
  public accountName: string

  @column()
  public balance: number

  @column()
  public number: string

  @column()
  public type: BillingType | null

  @column()
  public refAmount: number

  @belongsTo(() => Coa)
  public coa: BelongsTo<typeof Coa>

  @belongsTo(() => Student)
  public student: BelongsTo<typeof Student>

  @belongsTo(() => Employee)
  public employee: BelongsTo<typeof Employee>

  @hasMany(() => Billing )
  public billings: HasMany<typeof Billing>
  
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(account: Account) {
    newId = uuidv4()
    account.id = newId
  }

  @afterCreate()
  public static setNewId(account: Account) {
    account.id = newId
  }
}
