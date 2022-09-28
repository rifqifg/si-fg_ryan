import { DateTime } from 'luxon'
import { afterCreate, BaseModel, beforeCreate, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import Employee from 'App/Models/Employee';
let newId = ""
export default class AssetLocation extends BaseModel {
  public static table = 'inventory.asset_locations';

  @column({ isPrimary: true })
  public id: string

  @column()
  public parent: string

  @column()
  public employeeId: string

  @belongsTo(() => Employee)
  public employee: BelongsTo<typeof Employee>

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
  public image: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(assetLocation: AssetLocation) {
    newId = uuidv4()
    assetLocation.id = newId
  }

  @afterCreate()
  public static setNewId(assetLocation: AssetLocation) {
    newId = uuidv4()
    assetLocation.id = newId
  }
}
