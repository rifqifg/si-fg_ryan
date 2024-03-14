import { DateTime } from "luxon";
import {
  BaseModel,
  BelongsTo,
  beforeCreate,
  belongsTo,
  column,
} from "@ioc:Adonis/Lucid/Orm";
import { v4 as uuidv4 } from "uuid";
import User from "App/Models/User";
import Foundation from "App/Modules/Foundation/Models/Foundation";

export default class Agenda extends BaseModel {
  public static table = "academic.agendas";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public name: string;

  @column()
  public countPresence: boolean;

  @column()
  public description: string | null;

  @column()
  public type: string;

  @column.date()
  public date: DateTime;

  @column()
  public userId: string;

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>;

  @column()
  public foundationId: string

  @belongsTo(() => Foundation)
  public foundation: BelongsTo<typeof Foundation>;

  @beforeCreate()
  public static assignUuid(a: Agenda) {
    a.id = uuidv4();
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
