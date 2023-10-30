import { DateTime } from 'luxon'
import { BaseModel, afterCreate, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import { statusRoutes } from '../lib/enum'
import { v4 as uuidv4 } from 'uuid'
let newId = ""

export default class RouteHist extends BaseModel {
  public static table = 'log.route_hists';

  @column({ isPrimary: true })
  public id: string

  @column()
  public method: string

  @column()
  public body: object

  @column()
  public params: object

  @column()
  public route: string

  @column()
  public status: statusRoutes

  @column()
  public activity: string

  @column()
  public message: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(RouteHist: RouteHist) {
    newId = uuidv4()
    RouteHist.id = newId
  }

  @afterCreate()
  public static setNewId(RouteHist: RouteHist) {
    RouteHist.id = newId
  }
}
