import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { checkRoleSuperAdmin } from 'App/Helpers/checkRoleSuperAdmin'
import EmployeeUnit from 'App/Models/EmployeeUnit'
import Unit from 'App/Models/Unit'
import CreateEmployeeUnitValidator from 'App/Validators/CreateEmployeeUnitValidator'
import UpdateEmployeeUnitValidator from 'App/Validators/UpdateEmployeeUnitValidator'
import { validate as uuidValidation } from "uuid"

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
        .firstOrFail()

      if (checkUnit.id !== payload.unitId) {
        return response.badRequest({ message: "Gagal menambahkan karyawan ke unit dikarenakan anda bukan ketua" })
      }
    }

    //cek lead harus satu disetiap unitnya
    if (payload.title === 'lead') {
      const checkLeadUnit = await Unit.query()
        .whereHas('employeeUnits', eu => eu
          .where('unit_id', payload.unitId)
          .andWhere('title', 'lead')
        )

      if (checkLeadUnit.length > 0) {
        return response.badRequest({ message: "Ketua unit hanya boleh ada 1" })
      }
    }

    //cek duplikat user
    const checkDuplikatUser = await EmployeeUnit.query()
      .where('unit_id', payload.unitId)
      .andWhere('employee_id', payload.employeeId)

    if (checkDuplikatUser.length > 0) {
      return response.badRequest({ message: "Anggota unit tidak boleh duplikat" })
    }

    try {
      const data = await EmployeeUnit.create(payload)

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

  public async update({ params, request, response, auth }: HttpContextContract) {
    const { id } = params
    const superAdmin = await checkRoleSuperAdmin()

    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Employee Unit ID tidak valid" });
    }

    const payload = await request.validate(UpdateEmployeeUnitValidator)

    try {
      const employeeUnit = await EmployeeUnit.findOrFail(id)

      if (!superAdmin) {
        //cek unit, apakah user yg login adalah lead atau bukan
        const checkUnit = await Unit.query()
          .whereHas('employeeUnits', eu => eu
            .where('employee_id', auth.user!.$attributes.employeeId)
            .andWhere('title', 'lead'))
          .firstOrFail()

        if (checkUnit.id !== employeeUnit.unitId) {
          return response.badRequest({ message: "Gagal mengubah data dikarenakan anda bukan ketua" })
        }
      }

      if (payload.title === 'lead') {
        const checkLeadUnit = await Unit.query()
          .whereHas('employeeUnits', eu => eu
            .where('unit_id', employeeUnit.unitId)
            .andWhere('title', 'lead')
          )

        if (checkLeadUnit.length > 0) {
          return response.badRequest({ message: "Ketua unit hanya boleh ada 1" })
        }
      }

      const data = await employeeUnit.merge(payload).save();

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

  public async destroy({ params, response, auth }: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Employee Unit ID tidak valid" });
    }

    try {
      const data = await EmployeeUnit.findOrFail(id);
      const superAdmin = await checkRoleSuperAdmin()

      if (!superAdmin) {
        const checkUnit = await Unit.query()
          .whereHas('employeeUnits', eu => eu
            .where('employee_id', auth.user!.$attributes.employeeId)
            .andWhere('title', 'lead'))
          .firstOrFail()

        if (checkUnit.id !== data.unitId) {
          return response.badRequest({ message: "Gagal menghapus data dikarenakan anda bukan ketua" })
        }
      }

      await data.delete();

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

}
