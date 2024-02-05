import Employee from "App/Models/Employee"
import { HttpContext } from "@adonisjs/core/build/standalone"

export const unitHelper = async (title = "") => {
  const { auth } = HttpContext.get()!
  const unitIds: string[] = []
  const employee = await Employee.query()
    .select('id', 'name')
    .preload('employeeUnits', eu => eu
      .select('id', 'title', 'unit_id')
      .if(title, q => q.where('title', title))
      .preload('unit'))
    .where('id', auth.user!.$attributes.employeeId)
    .firstOrFail()

    const dataObject = JSON.parse(JSON.stringify(employee))

    dataObject.employeeUnits.map(value => {
      unitIds.push(value.unit.id)
    })

    return unitIds
}
