import { DateTime } from "luxon";
import {
  BaseModel,
  BelongsTo,
  HasMany,
  afterCreate,
  beforeCreate,
  belongsTo,
  column,
  hasMany,
} from "@ioc:Adonis/Lucid/Orm";
import { v4 as uuidv4 } from "uuid";
import Teaching from "./Teaching";
import BukuNilai from "./BukuNilai";
import Foundation from "App/Modules/Foundation/Models/Foundation";
let newId = "";

export default class Subject extends BaseModel {
  public static table = "academic.subjects";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public name: string | null;

  @column()
  public description: string | null;

  @column()
  public isExtracurricular: boolean;

  @column()
  public teachingId: string | null;

  @hasMany(() => Teaching)
  public teaching: HasMany<typeof Teaching>;

  @hasMany(() => BukuNilai)
  public bukuNilai: HasMany<typeof BukuNilai>

  @column()
  public foundationId: string

  @belongsTo(() => Foundation)
  public foundation: BelongsTo<typeof Foundation>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeCreate()
  public static assignUuid(subject: Subject) {
    newId = uuidv4();
    subject.id = newId;
  }

  @afterCreate()
  public static setNewId(subject: Subject) {
    subject.id = newId;
  }
}
