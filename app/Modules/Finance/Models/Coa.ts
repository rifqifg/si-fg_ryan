import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { CoaTypes } from '../lib/enums';

export default class Coa extends BaseModel {
  public static table = 'finance.coas';

  @column({ isPrimary: true })
  public id: string

  @column()
  public parent_coa_id: string | null

  @column()
  public name: string

  @column()
  public type: CoaTypes

  @belongsTo(() => Coa)
  public parentCoa: BelongsTo<typeof Coa>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
