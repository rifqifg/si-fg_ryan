import { DateTime } from 'luxon'
import { afterCreate, BaseModel, beforeCreate, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Employee from 'App/Models/Employee';
import { v4 as uuidv4 } from 'uuid'
import Student from './Student';
let newId = ""
export default class Class extends BaseModel {
  public static table = 'academic.classes';

  public serializeExtras() {
    return {
      students_count: this.$extras.students_count
    }
  }

  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string | null

  @column()
  public description: string | null

  @column()
  public employeeId: string | null

  @belongsTo(() => Employee)
  public homeroomTeacher: BelongsTo<typeof Employee>

  @hasMany(() => Student)
  public students: HasMany<typeof Student>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(clazz: Class) {
    newId = uuidv4()
    clazz.id = newId
  }

  @afterCreate()
  public static setNewId(clazz: Class) {
    clazz.id = newId
  }
}
