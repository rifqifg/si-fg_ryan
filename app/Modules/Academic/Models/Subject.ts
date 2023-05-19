import { DateTime } from 'luxon'
import { BaseModel, afterCreate, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
let newId = ""

export default class Subject extends BaseModel {
  public static table = 'academic.subjects';

  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string | null

  @column()
  public description: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(subject: Subject) {
    newId = uuidv4()
    subject.id = newId
  }

  @afterCreate()
  public static setNewId(subject: Subject) {
    subject.id = newId
  }
}
