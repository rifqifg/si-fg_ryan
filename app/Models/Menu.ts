import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Function from './Function'

export default class Menu extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public moduleId: string

  @hasMany(() => Function)
  public functions: HasMany<typeof Function>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
