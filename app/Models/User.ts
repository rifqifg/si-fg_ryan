import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel, beforeCreate, afterCreate, hasOne, HasOne } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import Role from './Role'
let newId = ""

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public role: string

  @hasOne(() => Role, {
    foreignKey: 'name',
    localKey: 'role'
  })
  public roles: HasOne<typeof Role>

  @column()
  public employeeId: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public rememberMeToken?: string

  @column()
  public verified: boolean

  @column({ serializeAs: null })
  public verifyToken: string

  @column.dateTime({ serializeAs: null })
  public verifyExpiry: DateTime

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public deletedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  @beforeCreate()
  public static assignUuid(user: User) {
    newId = uuidv4()
    user.id = newId
  }

  @afterCreate()
  public static setNewId(user: User) {
    user.id = newId
  }
}

