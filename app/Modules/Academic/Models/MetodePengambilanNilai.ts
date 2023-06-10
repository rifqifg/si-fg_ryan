import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'

export default class MetodePengambilanNilai extends BaseModel {
  public static table = 'academic.metode_pengambilan_nilais';

  @column({ isPrimary: true })
  public id: string

  @column()
  public nama: string

  @beforeCreate()
  public static assignUuid(metodePengambilanNilai: MetodePengambilanNilai) {
    metodePengambilanNilai.id = uuidv4()
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
