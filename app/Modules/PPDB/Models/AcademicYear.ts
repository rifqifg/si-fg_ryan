import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
// import { v4 as uuidv4 } from 'uuid'

// let newId = ""

export default class AcademicYear extends BaseModel {
  public static table = 'ppdb.academic_years';

  @column({ isPrimary: true })
  public year: string

  @column()
  public description: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // @beforeCreate()
  // public static assignUuid(academicYear: AcademicYear) {
  //   if (!(academicYear.id)) {
  //     newId = uuidv4()
  //     academicYear.id = newId
  //   }
  // }

  // @afterCreate()
  // public static setNewId(academicYear: AcademicYear) {
  //   academicYear.id = newId
  // }
}
