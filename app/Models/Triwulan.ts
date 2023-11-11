import { DateTime } from 'luxon'
import { BaseModel, HasMany, afterCreate, beforeCreate, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from "uuid";
import Employee from './Employee';
import TriwulanEmployee from './TriwulanEmployee';
let newId = "";

export default class Triwulan extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column.date()
  public fromDate: DateTime

  @column.date()
  public toDate: DateTime

  @column()
  public description: string | null

  @hasMany(() => TriwulanEmployee)
  public triwulanEmployee: HasMany<typeof TriwulanEmployee>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(triwulan: Triwulan) {
    newId = uuidv4();
    triwulan.id = newId;
  }

  @afterCreate()
  public static setNewId(triwulan: Triwulan) {
    triwulan.id = newId;
  }

  @afterCreate()
  public static async insertTriwulanEmployee() {
    const employeeIds = await Employee.query().whereNull('date_out').preload('divisi', d => d.select('id'))
    const dataObject = JSON.parse(JSON.stringify(employeeIds))

    try {
      dataObject.map(async (value) => {
        await TriwulanEmployee.create({
          employeeId: value.id,
          triwulanId: newId,
        })
      });
    } catch (error) {
      console.log(error);
    }
  }
}
