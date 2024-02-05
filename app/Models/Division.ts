import { DateTime } from 'luxon'
import { afterCreate, BaseModel, beforeCreate, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import EmployeeDivision from './EmployeeDivision'
import Unit from './Unit'
let newId = ""

export default class Division extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public unitId: string

  @belongsTo(() => Unit)
  public unit: BelongsTo<typeof Unit>

  @hasMany(() => EmployeeDivision)
  public employees: HasMany<typeof EmployeeDivision>

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
