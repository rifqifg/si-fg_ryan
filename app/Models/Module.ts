import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Menu from './Menu'

export default class Module extends BaseModel {
  @column({ isPrimary: true })
  public id: string | null

  @column()
  public description: string | null

  @hasMany(() => Menu)
  public menus: HasMany<typeof Menu>

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime
}
