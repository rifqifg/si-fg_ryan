import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Employee from './Employee'
import Triwulan from './Triwulan'
import EmployeeDivision from './EmployeeDivision'
import { v4 as uuidv4 } from "uuid";
let newId = "";

export default class TriwulanEmployee extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public other_achievements_worth_noting: string | null

  @column()
  public specific_indiscipline_that_needs_to_be_noted: string | null

  @column()
  public suggestions_and_improvements: string | null

  @column()
  public employeeId: string;

  @belongsTo(() => Employee)
  public employee: BelongsTo<typeof Employee>;

  @column()
  public triwulanId: string;

  @belongsTo(() => Triwulan)
  public triwulan: BelongsTo<typeof Triwulan>;

  @column()
  public directSupervisorId: number[]

  @belongsTo(() => EmployeeDivision)
  public directSupervisor: BelongsTo<typeof EmployeeDivision>;

  @column()
  public indirectSupervisorId: number

  @belongsTo(() => EmployeeDivision)
  public indirectSupervisor: BelongsTo<typeof EmployeeDivision>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(TriwulanEmployee: TriwulanEmployee) {
    newId = uuidv4();
    TriwulanEmployee.id = newId;
  }

  @afterCreate()
  public static setNewId(TriwulanEmployee: TriwulanEmployee) {
    TriwulanEmployee.id = newId;
  }
}
