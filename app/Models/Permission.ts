import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Permission extends BaseModel {
  @column({ serializeAs: null })
  public roleId: string

  @column()
  public menuId: string

  @column()
  public type: string

  @column()
  public function: object

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime
}



