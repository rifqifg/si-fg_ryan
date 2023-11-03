import { DateTime } from 'luxon'
import { BaseModel, HasMany, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Class from './Class';

export default class Jurusan extends BaseModel {
  public static table = 'academic.jurusans';
  
  @column({ isPrimary: true })
  public id: string

  @column({ isPrimary: true })
  public kode: string

  @column()
  public nama: string


  @hasMany(() => Class)
  public students: HasMany<typeof Class>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
