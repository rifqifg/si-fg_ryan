import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Employee from './Employee'
import Division from './Division'

export default class EmployeeDivision extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public employeeId: string

  @belongsTo(() => Employee)
  public employee: BelongsTo<typeof Employee>

  @column()
  public divisionId: string

  @belongsTo(() => Division)
  public division: BelongsTo<typeof Division>

  @column()
  public title: string

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime
}
