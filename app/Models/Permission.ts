import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Permission extends BaseModel {
  @column()
  public role_id: string

  @column()
  public menu_id: string

  @column()
  public type: string

  @column()
  public function: object

  @column.dateTime({ autoCreate: true, })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}



