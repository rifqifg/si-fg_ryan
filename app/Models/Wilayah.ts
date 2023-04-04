import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Wilayah extends BaseModel {
  public static table = 'wilayah'

  @column({ isPrimary: true })
  public kode: string

  @column()
  public nama: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
