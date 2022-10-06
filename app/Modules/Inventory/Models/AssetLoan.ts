import { DateTime } from 'luxon'
import { afterCreate, BaseModel, beforeCreate, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import Asset from './Asset';
import AssetLoanBatch from './AssetLoanBatch';
import Student from 'Academic/Models/Student';
import Employee from 'App/Models/Employee';
let newId = ""

export default class AssetLoan extends BaseModel {
  public static table = 'inventory.asset_loans';

  @column({ isPrimary: true })
  public id: string

  @column()
  public assetId: string

  @belongsTo(() => Asset)
  public asset: BelongsTo<typeof Asset>

  @column()
  public assetLoanBatchId: string | null

  @belongsTo(() => AssetLoanBatch)
  public loanBatch: BelongsTo<typeof AssetLoanBatch>

  @column()
  public studentId: string | null

  @belongsTo(() => Student)
  public student: BelongsTo<typeof Student>

  @column()
  public employeeId: string | null

  @belongsTo(() => Employee)
  public employee: BelongsTo<typeof Employee>

  @column.dateTime()
  public startDate: DateTime | null

  @column.dateTime()
  public endDate: DateTime | null

  @column()
  public notes: string | null

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(loan: AssetLoan) {
    newId = uuidv4()
    loan.id = newId
  }

  @afterCreate()
  public static setNewId(loan: AssetLoan) {
    loan.id = newId
  }
}
