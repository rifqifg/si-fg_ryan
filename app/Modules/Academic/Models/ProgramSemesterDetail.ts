import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, beforeCreate, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import ProgramSemester from './ProgramSemester'
import KompetensiInti from './KompetensiInti'
import RencanaPengambilanNilai from './RencanaPengambilanNilai'

export default class ProgramSemesterDetail extends BaseModel {
  public static table = 'academic.program_semester_details';

  @column({ isPrimary: true })
  public id: string

  @column()
  public programSemesterId: string

  @column()
  public kompetensiIntiId: string

  @column()
  public kompetensiDasar: string

  @column()
  public kompetensiDasarIndex: number

  @column()
  public pertemuan: number

  @column()
  public materi: string

  @column()
  public metode: string

  @column()
  public kategori1: boolean

  @column()
  public kategori2: boolean

  @column()
  public kategori3: boolean

  @belongsTo(() => ProgramSemester)
  public programSemester: BelongsTo<typeof ProgramSemester>

  @belongsTo(() => KompetensiInti)
  public kompetensiInti: BelongsTo<typeof KompetensiInti>

  @hasMany(() => RencanaPengambilanNilai)
  public rpn: HasMany<typeof RencanaPengambilanNilai>

  @beforeCreate()
  public static assignUuid(prosemDetail: ProgramSemesterDetail) {
    prosemDetail.id = uuidv4()
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
