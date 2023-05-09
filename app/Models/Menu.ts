import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Function from './Function'

export default class Menu extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public description: string

  @column()
  public moduleId: string

  @hasMany(() => Function)
  public functions: HasMany<typeof Function>

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime
}
