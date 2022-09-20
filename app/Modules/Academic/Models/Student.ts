import { DateTime } from 'luxon'
import { afterCreate, BaseModel, beforeCreate, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Class from './Class';
import { v4 as uuidv4 } from 'uuid'
let newId = ""

export default class Student extends BaseModel {
  public static table = 'academic.students';

  @column({ isPrimary: true })
  public id: string

  @column()
  public classId: string | null

  @belongsTo(() => Class)
  public class: BelongsTo<typeof Class>

  @column()
  public nik: string | null

  @column()
  public name: string | null

  @column()
  public nis: string | null

  @column()
  public nisn: string | null

  @column()
  public birth_city: string | null

  @column.date()
  public birth_day: DateTime | null

  @column()
  public religion: string | null

  @column()
  public address: string | null

  @column()
  public rt: string | null

  @column()
  public rw: string | null

  @column()
  public desa: string | null

  @column()
  public kel: string | null

  @column()
  public kec: string | null

  @column()
  public kot: string | null

  @column()
  public prov: string | null

  @column()
  public zip: string | null

  @column()
  public phone: string | null

  @column()
  public mobilePhone: string | null

  @column()
  public email: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime | null

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime | null

  @beforeCreate()
  public static assignUuid(student: Student) {
    newId = uuidv4()
    student.id = newId
  }

  @afterCreate()
  public static setNewId(student: Student) {
    student.id = newId
  }
}
