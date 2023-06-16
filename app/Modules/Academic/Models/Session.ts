import { DateTime } from 'luxon'
import { BaseModel, afterCreate, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
let newId = ""

export default class Session extends BaseModel {
  public static table = 'academic.sessions';

  @column({ isPrimary: true })
  public id: string

  @column()
  public session: string

  @column()
  public time_in: string

  @column()
  public time_out: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(session: Session) {
    newId = uuidv4()
    session.id = newId
  }

  @afterCreate()
  public static setNewId(session: Session) {
    session.id = newId
  }
}
