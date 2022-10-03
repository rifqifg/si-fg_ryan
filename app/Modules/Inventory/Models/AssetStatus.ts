import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Asset from './Asset';

export default class AssetStatus extends BaseModel {
  public static table = 'inventory.asset_statuses';
  public serializeExtras() {
    return {
      asset_count: this.$extras.assets_count,
    }
  }

  @column({ isPrimary: true })
  public id: string

  @column()
  public type: string

  @column()
  public color: string

  @column()
  public notes: string

  @hasMany(() => Asset)
  public assets: HasMany<typeof Asset>

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime
}
