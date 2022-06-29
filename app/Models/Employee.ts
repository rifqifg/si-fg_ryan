import { DateTime } from 'luxon'
import { afterCreate, BaseModel, beforeCreate, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import Division from './Division'
let newId = ""

export default class Employee extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public nip: string

  @column()
  public name: string

  @column()
  public birthCity: string

  @column()
  public birthDay: Date

  @column()
  public gender: string

  @column()
  public address: string

  @column()
  public divisionId: string

  @hasOne(() => Division)
  public division: HasOne<typeof Division>

  @column()
  public status: string

  @column()
  public dateIn: Date

  @column()
  public dateOut: Date

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(employee: Employee) {
    newId = uuidv4()
    employee.id = newId
  }

  @afterCreate()
  public static setNewId(employee: Employee) {
    employee.id = newId
  }
}
