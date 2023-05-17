import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Employee from 'App/Models/Employee'
import { v4 as uuidv4 } from 'uuid'
let newId = ""

export default class Teacher extends BaseModel {
  public static table = 'academic.teachers';

  @column({ isPrimary: true })
  public id: string

  @column()
  public employeeId: string

  @belongsTo(() => Employee)
  public employee: BelongsTo<typeof Employee>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(teacher: Teacher) {
    newId = uuidv4()
    teacher.id = newId
  }

  @afterCreate()
  public static setNewId(teacher: Teacher) {
    teacher.id = newId
  }
}
