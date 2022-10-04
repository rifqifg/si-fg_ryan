import { DateTime } from 'luxon'
import { afterCreate, BaseModel, beforeCreate, belongsTo, BelongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import Employee from 'App/Models/Employee';
import AssetLoan from './AssetLoan';
let newId = ""

export default class AssetLoanBatch extends BaseModel {
  public static table = 'inventory.asset_loan_batches';
  public serializeExtras() {
    return {
      asset_loan: this.$extras.assetLoan_count,
    }
  }

  @column({ isPrimary: true })
  public id: string

  @column()
  public employeeId: string

  @belongsTo(() => Employee)
  public employee: BelongsTo<typeof Employee>

  @column()
  public type: string | null

  @column()
  public description: string | null

  @hasMany(() => AssetLoan)
  public assetLoan: HasMany<typeof AssetLoan>

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(batch: AssetLoanBatch) {
    newId = uuidv4()
    batch.id = newId
  }

  @afterCreate()
  public static setNewId(batch: AssetLoanBatch) {
    batch.id = newId
  }
}
