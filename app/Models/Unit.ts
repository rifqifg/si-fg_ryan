import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, HasMany, afterCreate, beforeCreate, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import EmployeeUnit from './EmployeeUnit'
import { v4 as uuidv4 } from 'uuid'
import Foundation from 'App/Modules/Foundation/Models/Foundation'
let newId = ""

export default class Unit extends BaseModel {

  public serializeExtras() {
    return {
      employeeUnits_count: this.$extras.employeeUnits_count,
    }
  }

  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public signature: string | null

  @hasMany(() => EmployeeUnit)
  public employeeUnits: HasMany<typeof EmployeeUnit>

  @column()
  public foundationId: string;

  @belongsTo(() => Foundation)
  public foundation: BelongsTo<typeof Foundation>;

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