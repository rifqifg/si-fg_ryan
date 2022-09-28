import { DateTime } from 'luxon'
import { afterCreate, BaseModel, beforeCreate, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import ModelCategory from './ModelCategory';
import Manufacturer from './Manufacturer';
let newId = ""
export default class Model extends BaseModel {
  public static table = 'inventory.models';

  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public number: string

  @column()
  public modelCategoryId: number

  @belongsTo(() => ModelCategory)
  public modelCategory: BelongsTo<typeof ModelCategory>

  @column()
  public manufacturerId: string

  @belongsTo(() => Manufacturer)
  public manufacturer: BelongsTo<typeof Manufacturer>

  @column()
  public eol: number

  @column()
  public notes: string

  @column()
  public image: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(model: Model) {
    newId = uuidv4()
    model.id = newId
  }

  @afterCreate()
  public static setNewId(model: Model) {
    newId = uuidv4()
    model.id = newId
  }

}
