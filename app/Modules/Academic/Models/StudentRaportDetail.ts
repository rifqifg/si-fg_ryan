import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import Subject from './Subject';
import StudentRaport from './StudentRaport';

let newId = ""

export default class StudentRaportDetail extends BaseModel {
  public static table = "academic.student_raport_details";
  
  @column({ isPrimary: true })
  public id: string

  @column()
  public subjectId: string

  @column()
  public nilaiPengetahuan: number

  @column()
  public nilaiKeterampilan: number

  @column()
  public nilaiSikap: string

  @column()
  public keteranganDalamEkstrakulikuler: string

  @column()
  public studentRaportId: string

  @belongsTo(() => StudentRaport)
  public studentRaports: BelongsTo<typeof StudentRaport>

  @belongsTo(() => Subject)
  public subject: BelongsTo<typeof Subject>

  @beforeCreate()
  public static assignUuid(StudentRaportDetail: StudentRaportDetail) {
    newId = uuidv4()
    StudentRaportDetail.id = newId
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
