import { DateTime } from 'luxon'
import { BaseModel, afterCreate, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import { AssessmentCategory } from 'App/lib/enum'
import { v4 as uuidv4 } from "uuid";
let newId = "";

export default class AssessmentComponent extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name:string

  @column()
  public category: AssessmentCategory

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(AssessmentComponent: AssessmentComponent) {
    newId = uuidv4();
    AssessmentComponent.id = newId;
  }

  @afterCreate()
  public static setNewId(AssessmentComponent: AssessmentComponent) {
    AssessmentComponent.id = newId;
  }
}
