import { DateTime } from 'luxon'
import { afterCreate, BaseModel, beforeCreate, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
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

  @column.date()
  public birthDay: DateTime

  @column()
  public gender: string

  @column()
  public address: string

  @column()
  public divisionId: string

  @belongsTo(() => Division)
  public division: BelongsTo<typeof Division>

  @column()
  public status: string

  @column.date()
  public dateIn: DateTime

  @column()
  public dateOut: DateTime

  @column()
  public rfid: string

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
