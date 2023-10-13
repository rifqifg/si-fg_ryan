import { DateTime } from 'luxon'
import { BaseModel, HasMany, afterCreate, afterUpdate, beforeCreate, beforeUpdate, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import MonthlyReportEmployee from './MonthlyReportEmployee'
import { v4 as uuidv4 } from 'uuid'
import Employee from './Employee'
import { HttpContext } from '@adonisjs/core/build/standalone'
let newId = ""

export default class MonthlyReport extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column.date()
  public fromDate: DateTime

  @column.date()
  public toDate: DateTime

  @hasMany(() => MonthlyReportEmployee)
  public monthlyReportEmployees: HasMany<typeof MonthlyReportEmployee>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(monthlyReport: MonthlyReport) {
    newId = uuidv4()
    monthlyReport.id = newId
  }

  @afterCreate()
  public static async setNewId(monthlyReport: MonthlyReport) {
    monthlyReport.id = newId
  }

  @afterCreate()
  public static async insertMonthlyReportEmployee() {
    const employeeIds = await Employee.query().select('id').whereNull('date_out')
    const dataObject = JSON.parse(JSON.stringify(employeeIds))

    dataObject.map(async (value) => (
      await MonthlyReportEmployee.create({
        employeeId: value.id,
        monthlyReportId: newId,
      })
    ));
  }

  @beforeUpdate()
  public static async deleteMonthlyReportEmployee() {
    const { request } = HttpContext.get()!
    const { id } = request.params()
    const { fromDate, toDate }: any = JSON.parse(request.raw()!)

    if (fromDate && toDate) {
      await MonthlyReportEmployee.query().where('monthly_report_id', id).delete()
    }
  }

  @afterUpdate()
  public static async generateMonthlyReportEmployee(monthlyReport: MonthlyReport) {
    const { request } = HttpContext.get()!
    const { fromDate, toDate }: any = JSON.parse(request.raw()!)
    if (fromDate && toDate) {
      const employeeIds = await Employee.query().select('id').whereNull('date_out')
      const dataObject = JSON.parse(JSON.stringify(employeeIds))

      dataObject.map(async (value) => (
        await MonthlyReportEmployee.create({
          employeeId: value.id,
          monthlyReportId: monthlyReport.id,
        })
      ));
    }
  }
}
