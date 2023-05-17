import { DateTime } from 'luxon'
import { BaseModel, HasOne, column, hasOne } from '@ioc:Adonis/Lucid/Orm'
import Employee from 'App/Models/Employee'

export default class Teacher extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public employeeId: string

  @hasOne(() => Employee)
  public employee: HasOne<typeof Employee>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
