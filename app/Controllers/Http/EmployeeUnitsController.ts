import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { checkRoleSuperAdmin } from 'App/Helpers/checkRoleSuperAdmin'
import EmployeeUnit from 'App/Models/EmployeeUnit'
import Unit from 'App/Models/Unit'
import CreateEmployeeUnitValidator from 'App/Validators/CreateEmployeeUnitValidator'
import DeleteManyEmployeeUnitValidator from 'App/Validators/DeleteManyEmployeeUnitValidator'
import UpdateEmployeeUnitValidator from 'App/Validators/UpdateEmployeeUnitValidator'
// import { validate as uuidValidation } from "uuid"

export default class EmployeeUnitsController {
  public async store({ request, response, auth }: HttpContextContract) {
    const payload = await request.validate(CreateEmployeeUnitValidator)

    const superAdmin = await checkRoleSuperAdmin()

    if (!superAdmin) {
      //cek unit, apakah user yg login adalah lead atau bukan
      const checkUnit = await Unit.query()
        .whereHas('employeeUnits', eu => eu
          .where('employee_id', auth.user!.$attributes.employeeId)
          .andWhere('title', 'lead'))
        .first()

      // if (checkUnit) {
      //   if (payload.employeeUnits.filter(unit => unit.unitId === checkUnit.id).length == 0) {
      //     return response.badRequest({ message: "Gagal menambahkan karyawan ke unit dikarenakan anda bukan ketua" })
      //   }
      // } else {
      //   return response.badRequest({ message: "Gagal menambahkan karyawan ke unit dikarenakan anda bukan ketua" })
      // }
      if (!checkUnit || payload.employeeUnits.every(unit => unit.unitId !== checkUnit.id)) {
        return response.badRequest({ message: "Gagal menambahkan karyawan ke unit dikarenakan anda bukan ketua" });
      }
    }

    //cek lead harus satu disetiap unitnya
    if (payload.employeeUnits.filter(employeeUnit => employeeUnit.title === 'lead').length > 0) {
      const checkLeadUnit = await Unit.query()
        .whereHas('employeeUnits', eu => eu
          .where('title', 'lead')
          .andWhereIn('unit_id', payload.employeeUnits.map(unit => unit.unitId))
        )

      if (checkLeadUnit.length > 0) {
        return response.badRequest({ message: "Ketua unit hanya boleh ada 1" })
      }
    }

    //cek duplikat user
    const checkDuplikatUser = await EmployeeUnit.query()
      .whereIn('unit_id', payload.employeeUnits.map(unit => unit.unitId))
      .andWhereIn('employee_id', payload.employeeUnits.map(employee => employee.employeeId))

    if (checkDuplikatUser.length > 0) {
      return response.badRequest({ message: "Anggota unit tidak boleh duplikat" })
    }

    try {
      const data = await EmployeeUnit.createMany(payload.employeeUnits)

      response.created({ message: "Berhasil menambahkan karyawan ke unit", data })
    } catch (error) {
      const message = "HRDEU01: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal create data",
        error: message,
        error_data: error,
      });
    }
  }

  public async update({ request, response, auth }: HttpContextContract) {
    const superAdmin = await checkRoleSuperAdmin()

    const payload = await request.validate(UpdateEmployeeUnitValidator)

    try {

      const employeeUnits = await EmployeeUnit.findMany(payload.employeeUnits.map(employeeUnit => employeeUnit.id))

      if (!superAdmin) {
        //cek unit, apakah user yg login adalah lead atau bukan
        const checkUnit = await Unit.query()
          .whereHas('employeeUnits', eu => eu
            .where('employee_id', auth.user!.$attributes.employeeId)
            .andWhere('title', 'lead'))
          .first()

        if (!checkUnit || employeeUnits.every(unit => unit.unitId !== checkUnit.id)) {
          return response.badRequest({ message: "Gagal update data anggota unit dikarenakan anda bukan ketua" });
        }
      }

      //cek lead harus satu disetiap unitnya
      if (payload.employeeUnits.filter(employeeUnit => employeeUnit.title === 'lead').length > 0) {
        const checkLeadUnit = await Unit.query()
          .whereHas('employeeUnits', eu => eu
            .where('title', 'lead')
            .andWhereIn('unit_id', employeeUnits.map(unit => unit.unitId))
          )

        if (checkLeadUnit.length > 0) {
          return response.badRequest({ message: "Ketua unit hanya boleh ada 1" })
        }
      }

      const data = await EmployeeUnit.updateOrCreateMany("id", payload.employeeUnits)

      response.ok({ message: "Berhasil mengubah data karyawan di unit", data })
    } catch (error) {
      const message = "HRDEU02: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal update data",
        error: message,
        error_data: error,
      });
    }

  }

  public async destroy({ request, response, auth }: HttpContextContract) {
    const payload = await request.validate(DeleteManyEmployeeUnitValidator)

    try {
      const employeeUnits = await EmployeeUnit.findMany(payload.employeeUnits)
      const superAdmin = await checkRoleSuperAdmin()

      if (!superAdmin) {
        //cek unit, apakah user yg login adalah lead atau bukan
        const checkUnit = await Unit.query()
          .whereHas('employeeUnits', eu => eu
            .where('employee_id', auth.user!.$attributes.employeeId)
            .andWhere('title', 'lead'))
          .first()

        if (!checkUnit || employeeUnits.every(unit => unit.unitId !== checkUnit.id)) {
          return response.badRequest({ message: "Gagal menghapus anggota unit dikarenakan anda bukan ketua" });
        }
      }

      await EmployeeUnit.query().whereIn("id", employeeUnits.map(employeeUnit => employeeUnit.id)).delete()

      response.ok({
        message: "Berhasil menghapus karyawan dari unit"
      })
    } catch (error) {
      const message = "HRDEU03: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }

  public async getListEmployeeUnits({ response, request }: HttpContextContract) {
    const { unitId } = request.qs()

    try {
      const data = await EmployeeUnit.query()
        .select('id', 'employee_id', 'unit_id', 'title')
        .where('unit_id', unitId)
        .preload('employee', e => e.select('name'))

      response.ok({ message: "Berhasil get data", data })
    } catch (error) {
      const message = "HRDEU04: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }

}
