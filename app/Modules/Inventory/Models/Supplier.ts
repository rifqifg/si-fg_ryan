import { DateTime } from 'luxon'
import { afterCreate, BaseModel, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
let newId = ""

export default class Supplier extends BaseModel {
  public static table = 'inventory.suppliers';

  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public address: string

  @column()
  public city: string

  @column()
  public state: string

  @column()
  public country: string

  @column()
  public zipcode: string

  @column()
  public contactName: string

  @column()
  public phone: string

  @column()
  public fax: string

  @column()
  public email: string

  @column()
  public url: string

  @column()
  public notes: string

  @column()
  public image: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(supplier: Supplier) {
    newId = uuidv4()
    supplier.id = newId
  }

  @afterCreate()
  public static setNewId(supplier: Supplier) {
    supplier.id = newId
  }
}
