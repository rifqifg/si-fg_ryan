import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Coa from './Coa';
import Student from 'App/Modules/Academic/Models/Student';
import Employee from 'App/Models/Employee';
import { v4 as uuidv4 } from 'uuid'

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
  public balance: string

  @column()
  public number: string

  @column()
  public refAmount: number

  @belongsTo(() => Coa)
  public coa: BelongsTo<typeof Coa>

  @belongsTo(() => Student)
  public student: BelongsTo<typeof Student>

  @belongsTo(() => Employee)
  public employee: BelongsTo<typeof Employee>

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
