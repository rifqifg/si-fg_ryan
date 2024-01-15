import { DateTime } from 'luxon'
import { BaseModel, HasMany, afterCreate, beforeCreate, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import EmployeeUnit from './EmployeeUnit'
import { v4 as uuidv4 } from 'uuid'
let newId = ""

export default class Unit extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public description: string

  @hasMany(() => EmployeeUnit)
  public employees: HasMany<typeof EmployeeUnit>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(Unit: Unit) {
    newId = uuidv4()
    Unit.id = newId
  }

  @afterCreate()
  public static setNewId(Unit: Unit) {
    Unit.id = newId
  }
}
