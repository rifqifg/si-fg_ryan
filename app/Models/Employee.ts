import { DateTime } from 'luxon'
import { afterCreate, BaseModel, beforeCreate, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import Division from './Division'
import Wilayah from './Wilayah'
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
  public divisionId: string | null

  @belongsTo(() => Division)
  public division: BelongsTo<typeof Division>

  @column()
  public status: string

  @column.date()
  public dateIn: DateTime

  @column.date()
  public dateOut: DateTime | null

  @column()
  kodeProvinsi: string | null

  @belongsTo(() => Wilayah, {
    localKey: 'kode',
    foreignKey: 'kodeProvinsi'
  })
  provinsi: BelongsTo<typeof Wilayah>

  @column()
  kodeKota: string | null

  @belongsTo(() => Wilayah, {
    localKey: 'kode',
    foreignKey: 'kodeKota'
  })
  kota: BelongsTo<typeof Wilayah>

  @column()
  kodeKecamatan: string | null

  @belongsTo(() => Wilayah, {
    localKey: 'kode',
    foreignKey: 'kodeKecamatan'
  })
  kecamatan: BelongsTo<typeof Wilayah>

  @column()
  kodeKelurahan: string | null

  @belongsTo(() => Wilayah, {
    localKey: 'kode',
    foreignKey: 'kodeKelurahan'
  })
  kelurahan: BelongsTo<typeof Wilayah>

  @column({ serializeAs: null })
  public rfid: string | null

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
