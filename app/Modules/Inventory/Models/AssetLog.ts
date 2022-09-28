import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Asset from './Asset'
import AssetLogType from './AssetLogType'
import Student from 'Academic/Models/Student'
import Employee from 'App/Models/Employee'

export default class AssetLog extends BaseModel {
  public static table = 'inventory.asset_logs';

  @column({ isPrimary: true })
  public id: number

  @column()
  public assetId: string

  @belongsTo(() => Asset)
  public asset: BelongsTo<typeof Asset>

  @column()
  public assetLogTypeId: string

  @belongsTo(() => AssetLogType)
  public assetLogType: BelongsTo<typeof AssetLogType>

  @column()
  public studentId: string

  @belongsTo(() => Student)
  public student: BelongsTo<typeof Student>

  @column()
  public employeeId: string

  @belongsTo(() => Employee)
  public employee: BelongsTo<typeof Employee>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
