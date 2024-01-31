import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { checkRoleSuperAdmin } from 'App/Helpers/checkRoleSuperAdmin'
import Division from 'App/Models/Division'
import Employee from 'App/Models/Employee'
import EmployeeDivision from 'App/Models/EmployeeDivision'
import EmployeeUnit from 'App/Models/EmployeeUnit'
import Unit from 'App/Models/Unit'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'
import AddEmployeeToDivisionValidator from 'App/Validators/AddEmployeeToDivisionValidator'
import DeleteManyEmployeeDivisionValidator from 'App/Validators/DeleteManyEmployeeDivisionValidator'
import EditEmployeeTitleInDivisionValidator from 'App/Validators/EditEmployeeTitleInDivisionValidator'
import { DateTime } from 'luxon'

export default class EmployeeDivisionsController {
  public async store({  request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)

    const payload = await request.validate(AddEmployeeToDivisionValidator)
    const superAdmin = await checkRoleSuperAdmin()

    // grab divisionId from payload


    try {
      // TODO: cek hanya boleh ketua divisi / unit yg input


      // if (!superAdmin) {
      //   const checkUnitLead = await EmployeeUnit.query()
      //     .where('employee_id', auth.user!.$attributes.employeeId)
      //     .andWhere('title', 'lead')
      //     .first()
      // }

      //cek ketua divisi harus satu disetiap divisinya
      if (payload.employeeDivisions.filter(ed => ed.title === 'lead').length > 0) {
        const checkLeadDivision = await Division.query()
          .whereHas('employees', employee => {
            employee
              .where('title', 'lead')
              .andWhereIn('division_id', payload.employeeDivisions.map(unit => unit.divisionId))
          })

        if (checkLeadDivision.length > 0) {
          throw new Error("Ketua divisi hanya boleh ada satu")
        }
      }

      //cek duplikat user
      const cekDuplikatUser = await EmployeeDivision.query()
        .whereIn('division_id', payload.employeeDivisions.map(ed => ed.divisionId))
        .andWhereIn('employee_id', payload.employeeDivisions.map(ed => ed.employeeId))

      if (cekDuplikatUser.length > 0) {
        throw new Error("Anggota divisi tidak boleh duplikat")
      }

      // TODO: cek employee dari divisi lain?

      const data = await EmployeeDivision.createMany(payload.employeeDivisions)

      response.created({ message: "Berhasil menambahkan karyawan ke divisi", data })
      CreateRouteHist(statusRoutes.FINISH, dateStart)
    } catch (error) {
      const message = "HRDEDV01: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal create data",
        error: message,
        error_data: error,
      });
    }
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

  public async destroy({ request, response, auth }: HttpContextContract) {
    const payload = await request.validate(DeleteManyEmployeeDivisionValidator)
    // const superAdmin = await checkRoleSuperAdmin()

    // TODO: cek hanya boleh ketua divisi / unit yg input

    try {
      await EmployeeDivision.query()
        .whereIn("employee_id", payload.employeeDivisions.map(ed => ed.employeeId))
        .andWhereIn("division_id", payload.employeeDivisions.map(ed => ed.divisionId))
        .delete()

      response.ok({
        message: "Berhasil menghapus karyawan dari unit"
      })
    } catch (error) {
      const message = "HRDEDV03: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }
}
