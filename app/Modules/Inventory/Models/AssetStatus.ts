import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class AssetStatus extends BaseModel {
  public static table = 'inventory.asset_statuses';

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public type: string

  @column()
  public color: string

  @column()
  public notes: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
