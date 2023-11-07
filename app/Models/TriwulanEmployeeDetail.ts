import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import TriwulanEmployee from './TriwulanEmployee';
import AssesmentComponent from './AssessmentComponent';
import { v4 as uuidv4 } from "uuid";
let newId = "";

export default class TriwulanEmployeeDetail extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public skor: number

  @belongsTo(() => TriwulanEmployee)
  public triwulanEmployee: BelongsTo<typeof TriwulanEmployee>;

  @column()
  public triwulanEmployeeId: string

  @belongsTo(() => AssesmentComponent)
  public assessmentComponent: BelongsTo<typeof AssesmentComponent>;

  @column()
  public assessmentComponentId: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(TriwulanEmployeeDetail: TriwulanEmployeeDetail) {
    newId = uuidv4();
    TriwulanEmployeeDetail.id = newId;
  }

  @afterCreate()
  public static setNewId(TriwulanEmployeeDetail: TriwulanEmployeeDetail) {
    TriwulanEmployeeDetail.id = newId;
  }
}
