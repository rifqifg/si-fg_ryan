import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column, afterFetch, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Activity from './Activity';
import { v4 as uuidv4 } from 'uuid'
let newId = ""
import Drive from '@ioc:Adonis/Core/Drive'
import Env from "@ioc:Adonis/Core/Env"
import Presence from './Presence';

export default class SubActivity extends BaseModel {

  public serializeExtras() {
    return {
      presence_count: this.$extras.presence_count,
    }
  }

  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public images: string[] | null | any

  @column.dateTime()
  public date: DateTime;

  @column()
  public note: string | null;

  @belongsTo(() => Activity)
  public activity: BelongsTo<typeof Activity>;

  @column()
  public activityId: string;

  @hasMany(() => Presence)
  public presence: HasMany<typeof Presence>;

  @column()
  public presenceId: string | null;

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

  // TIPS : upload file. ini untuk serialize field image menjadi signedUrl instead of filename aja
  @afterFetch()
  public static afterFetchHook(subActivities: SubActivity[]) {
    subActivities.forEach(async sa => {
      for (let i = 0; i < sa.images.length; i++) {
        const beHost = Env.get('BE_URL')
        const signedUrl = beHost + await Drive.use('hrd').getSignedUrl('subActivities/' + sa.images[i], { expiresIn: '30mins' })
        sa.images[i] = [sa.images[i], signedUrl];
      }
    })
  }
}
