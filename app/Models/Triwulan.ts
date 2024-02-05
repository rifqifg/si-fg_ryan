import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, HasMany, afterCreate, beforeCreate, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from "uuid";
// import Employee from './Employee';
import TriwulanEmployee from './TriwulanEmployee';
// import EmployeeDivision from './EmployeeDivision';
// import Division from './Division';
let newId = "";
import { validator, schema, rules } from '@ioc:Adonis/Core/Validator'
import EmployeeUnit from './EmployeeUnit';
import Unit from './Unit';

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

  @column()
  public unitId: string

  @belongsTo(() => Unit)
  public unit: BelongsTo<typeof Unit>

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
  public static async insertTriwulanEmployee(triwulan: Triwulan) {
    // const employeeIds = await Employee.query().whereNull('date_out').preload('divisi', d => d.select('id'))
    // const employeeIdsObject = JSON.parse(JSON.stringify(employeeIds))

    const employeeIdUnit = await EmployeeUnit.query()
      .where('unit_id', triwulan.unitId)

    const employeeIdUnitObject = JSON.parse(JSON.stringify(employeeIdUnit))

    try {
      await Promise.all(
        employeeIdUnitObject.map(async (value) => {
          const payload = await validator.validate({
            schema: schema.create({
              triwulanId: schema.string({}, [
                rules.exists({ table: 'triwulans', column: 'id' })
              ]),
              employeeId: schema.string({}, [
                rules.exists({ table: 'employees', column: 'id' })
              ]),
            }),
            data: {
              employeeId: value.employee_id,
              triwulanId: newId,
            }
          })

          await TriwulanEmployee.create(payload);
        })
      );
    } catch (error) {
      console.log(error.message);
    }
  }

  // @afterCreate()
  // public static async insertTriwulanEmployee() {
  // const employeeIds = await Employee.query().whereNull('date_out').preload('divisi', d => d.select('id'))
  // const employeeIdsObject = JSON.parse(JSON.stringify(employeeIds))
  //   const divisiHrd = await Division.query()
  //     .select('id', 'name')
  //     .whereILike('name', `%hrd%`)
  //     .firstOrFail()
  //   const divisiHrdObject = JSON.parse(JSON.stringify(divisiHrd))

  // try {
  //   await Promise.all(
  //     employeeIdsObject.map(async (value) => {
  //       let employeeDivisionIds: any = []
  //       const employeDivisions = await EmployeeDivision.query()
  //         .where('employee_id', value.id)
  //         .preload('division', d => d.select('id', 'name'))
  //       const employeeDivisionsObject = JSON.parse(JSON.stringify(employeDivisions))
  //       if (employeeDivisionsObject.length > 0) {
  //         employeeDivisionsObject.map(edo => {
  //           if (edo.title == 'member') {
  //             employeeDivisionIds.push(edo.division_id)
  //           } else {
  //             employeeDivisionIds.push(divisiHrdObject.id)
  //           }
  //         })
  //       }

  //       const payload = await validator.validate({
  //         schema: schema.create({
  //           directSupervisor: schema.array().members(schema.string({}, [
  //             rules.exists({ table: 'divisions', column: 'id' })
  //           ])),
  //           indirectSupervisor: schema.string({}, [
  //             rules.exists({ table: 'divisions', column: 'id' })
  //           ]),
  //           triwulanId: schema.string({}, [
  //             rules.exists({ table: 'triwulans', column: 'id' })
  //           ]),
  //           employeeId: schema.string({}, [
  //             rules.exists({ table: 'employees', column: 'id' })
  //           ]),
  //         }),
  //         data: {
  //           employeeId: value.id,
  //           triwulanId: newId,
  //           indirectSupervisor: divisiHrdObject.id,
  //           directSupervisor: employeeDivisionIds
  //         }
  //       })

  //       await TriwulanEmployee.create(payload);
  //     })
  //   );
  // } catch (error) {
  //   console.log(error.message);
  // }

  // }
}
