import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { BaseModel, afterCreate, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import { beforeSave } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'

let newId = ""

export default class UserStudentCandidate extends BaseModel {
  public static table = 'ppdb.user_student_candidates';

  @column({ isPrimary: true })
  public id: string

  @column()
  public nisn: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column({ serializeAs: null })
  public rememberMeToken?: string

  @column()
  public verified: boolean

  @column({ serializeAs: null })
  public verifyToken: string

  @column.dateTime({ serializeAs: null })
  public verifyExpiry: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(userStudentCandidate: UserStudentCandidate) {
    if (userStudentCandidate.$dirty.password) {
      userStudentCandidate.password = await Hash.make(userStudentCandidate.password)
    }
  }

  @beforeCreate()
  public static assignUuid(userStudentCandidate: UserStudentCandidate) {
    newId = uuidv4()
    userStudentCandidate.id = newId
  }

  @afterCreate()
  public static setNewId(userStudentCandidate: UserStudentCandidate) {
    userStudentCandidate.id = newId
  }
}
