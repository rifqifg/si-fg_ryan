import { DateTime } from 'luxon'
import {
  BaseModel,
  afterCreate,
  beforeCreate,
  column,
} from "@ioc:Adonis/Lucid/Orm";
import { v4 as uuidv4 } from "uuid";
let newId = "";

export default class TemplateExcel extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public link: string

  @column()
  public description: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(template: TemplateExcel) {
    newId = uuidv4();
    template.id = newId;
  }

  @afterCreate()
  public static setNewId(template: TemplateExcel) {
    template.id = newId;
  }
}
