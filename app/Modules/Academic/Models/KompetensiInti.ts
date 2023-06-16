import { DateTime } from 'luxon'
import { BaseModel, HasMany, beforeCreate, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import ProgramSemesterDetail from './ProgramSemesterDetail';

export default class KompetensiInti extends BaseModel {
  public static table = 'academic.kompetensi_intis';

  @column({ isPrimary: true })
  public id: string

  @column()
  public nama: string

  @hasMany(() => ProgramSemesterDetail)
  public programSemesterDetail: HasMany<typeof ProgramSemesterDetail>

  @beforeCreate()
  public static assignUuid(ki: KompetensiInti) {
    ki.id = uuidv4()
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
