import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Employee from 'App/Models/Employee'
import EmployeeDivision from 'App/Models/EmployeeDivision'
import AddEmployeeToDivisionValidator from 'App/Validators/AddEmployeeToDivisionValidator'
import EditEmployeeTitleInDivisionValidator from 'App/Validators/EditEmployeeTitleInDivisionValidator'

export default class EmployeeDivisionsController {
  public async store({ params, request, response }: HttpContextContract) {
    const { employee_id } = params
    await Employee.findOrFail(employee_id)

    const payload = await request.validate(AddEmployeeToDivisionValidator)

    await EmployeeDivision.create({ employeeId: employee_id, ...payload })

    response.created({
      message: "Berhasil menambahakan karyawan ke divisi"
    })
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { employee_id, id } = params
    const payload = await request.validate(EditEmployeeTitleInDivisionValidator)

    const data = await EmployeeDivision.query().where('employee_id', employee_id).where('division_id', id).firstOrFail()
    await data.merge(payload).save()

    response.ok({
      message: "Berhasil mengubah jabatan karyawan di divisi"
    })
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { employee_id, id } = params

    const data = await EmployeeDivision.query().where('employee_id', employee_id).where('division_id', id).firstOrFail()
    await data.delete()

    response.ok({
      message: "Berhasil menghapus karyawan dari divisi"
    })
  }


}
