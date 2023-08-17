import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Activity from './Activity';
import { v4 as uuidv4 } from 'uuid'
let newId = ""

export default class SubActivity extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column({ serializeAs: 'images' })
  public images: string[] | null;

  @column.dateTime()
  public date: DateTime;

  @column()
  public note: string | null;

  @belongsTo(() => Activity)
  public activity: BelongsTo<typeof Activity>;

  @column()
  public activityId: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(SubActivity: SubActivity) {
    newId = uuidv4()
    SubActivity.id = newId
  }

  @afterCreate()
  public static setNewId(SubActivity: SubActivity) {
    SubActivity.id = newId
  }
}
