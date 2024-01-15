import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Employee from './Employee'
import Unit from './Unit'
import { v4 as uuidv4 } from 'uuid'
let newId = ""

export default class EmployeeUnit extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public employeeId: string

  @belongsTo(() => Employee)
  public employee: BelongsTo<typeof Employee>

  @column()
  public unitId: string

  @belongsTo(() => Unit)
  public unit: BelongsTo<typeof Unit>

  @column()
  public title: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(EmployeeUnit: EmployeeUnit) {
    newId = uuidv4()
    EmployeeUnit.id = newId
  }

  @afterCreate()
  public static setNewId(EmployeeUnit: EmployeeUnit) {
    EmployeeUnit.id = newId
  }
}
