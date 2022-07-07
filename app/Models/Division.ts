import { DateTime } from 'luxon'
import { afterCreate, BaseModel, beforeCreate, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import Employee from './Employee'
let newId = ""

export default class Division extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public pic: string | null

  @belongsTo(() => Employee, { foreignKey: 'pic' })
  public pic_detail: BelongsTo<typeof Employee>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(division: Division) {
    newId = uuidv4()
    division.id = newId
  }

  @afterCreate()
  public static setNewId(division: Division) {
    division.id = newId
  }
}
