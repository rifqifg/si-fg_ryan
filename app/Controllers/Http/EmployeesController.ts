import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { checkRoleSuperAdmin } from "App/Helpers/checkRoleSuperAdmin";
import { RolesHelper } from "App/Helpers/rolesHelper";
import Activity from "App/Models/Activity";
import Division from "App/Models/Division";
import Employee from "App/Models/Employee";
import EmployeeDivision from "App/Models/EmployeeDivision";
import EmployeeUnit from "App/Models/EmployeeUnit";
import Unit from "App/Models/Unit";
import User from "App/Models/User";
import { CreateRouteHist } from "App/Modules/Log/Helpers/createRouteHist";
import { statusRoutes } from "App/Modules/Log/lib/enum";
import CreateEmployeeValidator from "App/Validators/CreateEmployeeValidator";
import UpdateEmployeeValidator from "App/Validators/UpdateEmployeeValidator";
import { DateTime } from "luxon";

export default class EmployeesController {
  public async index({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const {
      page = 1,
      limit = 10,
      keyword = "",
      employeeTypeId = "",
      divisionId = "",
      isActive = "",
      orderBy = "name",
      orderDirection = "ASC",
      foundationId
    } = request.qs();

    const superAdmin = await checkRoleSuperAdmin()
    const user = await User.query()
      .preload('employee', e => e
        .select('id', 'name', 'foundation_id'))
      .where('employee_id', auth.user!.$attributes.employeeId)
      .first()

    const data = await Employee.query()
      .select("*")
      .if(employeeTypeId, (e) => e.where("employeeTypeId", employeeTypeId))
      .preload(
        "divisions",
        (d) => (
          d.select("title", "divisionId"),
          d.preload("division", (x) => x.select("name"))
        )
      )
      .if(divisionId, d => d.whereHas("divisions", (q) => q.where("divisionId", "=", divisionId)))
      .preload("provinsi")
      .preload("kota")
      .preload("kecamatan")
      .preload("kelurahan")
      .preload("employeeUnits", eu => eu.select('title', 'id', 'unit_id').preload('unit', u => u.select('name')))
      .preload("foundation", f => f.select('name'))
      .andWhere((query) => {
        query.whereILike("name", `%${keyword}%`);
        query.orWhereILike("nik", `%${keyword}%`);
        query.orWhereILike("nip", `%${keyword}%`);
        // query.orWhereILike("division", `%${keyword}%`);
      })
      .if(isActive === "not_active", q => q.andWhereNotNull('date_out'))
      .if(isActive === "active", q => q.andWhereNull('date_out'))
      .if(!superAdmin, q => q.andWhere('foundation_id', user!.employee.foundationId))
      //filter superadmin by foundation id
      .if(superAdmin && foundationId, q => q.andWhere('foundation_id', foundationId))
      .orderBy(orderBy, orderDirection)
      .paginate(page, limit);

    CreateRouteHist(statusRoutes.FINISH, dateStart)
    response.ok({ message: "Data Berhasil Didapatkan", data });
  }

  public async getEmployee({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const {
      keyword = "",
      employeeTypeId = "",
      divisionId = "",
      orderBy = "name",
      orderDirection = "ASC",
      activityId,
      foundationId
    } = request.qs();

    let unitId
    if (activityId) {
      const activity = await Activity.query()
        .select('id', 'unit_id')
        .where('id', activityId)
        .first()

      unitId = activity?.unitId
    }

    const user = await User.query()
      .preload('employee', e => e
        .select('id', 'name', 'foundation_id'))
      .preload('roles', r => r
        .preload('role'))
      .where('employee_id', auth.user!.$attributes.employeeId)
      .first()

    const userObject = JSON.parse(JSON.stringify(user))
    const roles = await RolesHelper(userObject)

    const data = await Employee.query()
      .select("*")
      .if(employeeTypeId, (e) => e.where("employeeTypeId", employeeTypeId))
      .preload(
        "divisions",
        (d) => (
          d.select("title", "divisionId"),
          d.preload("division", (x) => x.select("name"))
        )
      )
      .if(divisionId, d => d.whereHas("divisions", (q) => q.where("divisionId", "=", divisionId)))
      .preload("provinsi")
      .preload("kota")
      .preload("kecamatan")
      .preload("kelurahan")
      .andWhereNull("date_out")
      .andWhere((query) => {
        query.whereILike("name", `%${keyword}%`);
        query.orWhereILike("nik", `%${keyword}%`);
        query.orWhereILike("nip", `%${keyword}%`);
        // query.orWhereILike("division", `%${keyword}%`);
      })
      .if(unitId, query => query
        .whereHas('employeeUnits', u => u
          .where('unit_id', unitId)))
      .if(!roles.includes('super_admin'), query => query
        .where('foundation_id', user!.employee.foundationId)
      )
      .if(roles.includes('super_admin') && foundationId, query => query
        .where('foundation_id', foundationId))
      .orderBy(orderBy, orderDirection)

    CreateRouteHist(statusRoutes.FINISH, dateStart)
    response.ok({ message: "Data Berhasil Didapatkan", data });
  }

  public async store({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const payload = await request.validate(CreateEmployeeValidator);
    const superAdmin = await checkRoleSuperAdmin()
    //kalo bukan superadmin maka foundationId nya di hardcode
    if (!superAdmin) {
      const user = await User.query()
        .preload('employee', e => e
          .select('id', 'name', 'foundation_id'))
        .where('employee_id', auth.user!.$attributes.employeeId)
        .first()

      payload.foundationId = user!.employee.foundationId
    }

    try {
      const data = await Employee.create(payload);

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Create data success", data });
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      console.log(error);
      return response.internalServerError(error);
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { id } = params;
    try {
      const data = await Employee.query()
        .select("*")
        .preload("divisions", (d) =>
          d.preload("division", (x) => x.select("name"))
        )
        .preload("provinsi")
        .preload("kota")
        .preload("kecamatan")
        .preload("kelurahan")
        .preload(
          "divisions",
          (d) => (
            d.select("title", "divisionId"),
            d.preload("division", (x) => x.select("name"))
          )
        )
        .preload("employeeUnits", eu => eu.select('title', 'id', 'unit_id').preload('unit', u => u.select('name')))
        .preload("foundation", f => f.select('name'))
        .where("id", id);
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Get data success", data });
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      console.log(error);
      return response.internalServerError(error);
    }
  }

  public async update({ params, request, response, auth }: HttpContextContract) {
    const { id } = params;

    const payload = await request.validate(UpdateEmployeeValidator);
    if (payload.kodeProvinsi === null) {
      payload["kodeKota"] = null;
      payload["kodeKecamatan"] = null;
      payload["kodeKelurahan"] = null;
    }

    try {
      const data = await Employee.query()
        .where('id', id)
        .preload("employeeUnits", eu => eu.select('title', 'id', 'unit_id').preload('unit', u => u.select('name')))
        .firstOrFail();

      //cek lead unit
      const user = await User.query()
        .preload('employee', e => e
          .select('id', 'name')
          .preload('employeeUnits', eu => eu
            .where('title', 'lead')
            .preload('unit')))
        .preload('roles', r => r
          .preload('role'))
        .where('id', auth.use('api').user!.id)
        .firstOrFail()

      const userObject = JSON.parse(JSON.stringify(user))
      const roles = RolesHelper(userObject)
      if (roles.includes('admin_hrd')) {
        let aprove = false
        // userObject.employee.employeeUnits[0].unit.id
        data.employeeUnits.map(value => {
          if (value.unit.id == userObject.employee.employeeUnits[0].unit.id) {
            aprove = true
          }
        })

        if (!aprove) {
          return response.badRequest({ message: "Gagal update data employee dikarenakan anda bukan ketua unit tersebut" });
        }
      }

      await data.merge(payload).save();

      response.ok({ message: "Update data success", data });
    } catch (error) {
      console.log(error);
      response.internalServerError(error);
    }
  }

  public async destroy({ params, response, auth }: HttpContextContract) {
    const { id } = params;
    try {
      const data = await Employee.query()
        .where('id', id)
        .preload("employeeUnits", eu => eu.select('title', 'id', 'unit_id').preload('unit', u => u.select('name')))
        .firstOrFail();

      //cek lead unit
      const user = await User.query()
        .preload('employee', e => e
          .select('id', 'name')
          .preload('employeeUnits', eu => eu
            .where('title', 'lead')
            .preload('unit')))
        .preload('roles', r => r
          .preload('role'))
        .where('id', auth.use('api').user!.id)
        .firstOrFail()

      const userObject = JSON.parse(JSON.stringify(user))
      const roles = RolesHelper(userObject)
      if (roles.includes('admin_hrd')) {
        let aprove = false
        // userObject.employee.employeeUnits[0].unit.id
        data.employeeUnits.map(value => {
          if (value.unit.id == userObject.employee.employeeUnits[0].unit.id) {
            aprove = true
          }
        })

        if (!aprove) {
          return response.badRequest({ message: "Gagal update data employee dikarenakan anda bukan ketua unit tersebut" });
        }
      }
      await data.delete();

      response.ok({ message: "Delete data success" });
    } catch (error) {
      console.log(error);
      response.internalServerError(error);
    }
  }

  public async getEmployeesNotInUnit({ request, response }: HttpContextContract) {
    try {
      const {
        page = 1,
        limit = 10,
        keyword = "",
        unitId
      } = request.qs();

      const employeeUnit = await EmployeeUnit.query()
        .select('employee_id')
        .preload('employee', e => e.select('name'))
        .where('unit_id', unitId)

      const unit = await Unit.query()
        .select('foundation_id')
        .where('id', unitId)
        .first()

      const employeeIds: any = []

      employeeUnit.map(value => {
        employeeIds.push(value.$attributes.employeeId)
      })

      const data = await Employee.query()
        .select('id', 'name')
        .whereNull('date_out')
        .andWhereILike('name', `%${keyword}%`)
        .andWhereNotIn('id', employeeIds)
        .andWhere('foundation_id', unit!.foundationId)
        .orderBy('name', 'asc')
        .paginate(page, limit)

      response.ok({ message: "Data Berhasil Didapatkan", data });
    } catch (error) {
      const message = "HRDE07: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }
  public async getEmployeesNotInDivision({ request, response }: HttpContextContract) {
    const {
      page = 1,
      limit = 10,
      keyword = "",
      divisionId
    } = request.qs();

    try {
      const employeeDivision = await EmployeeDivision.query()
        .where('division_id', divisionId)

      const checkUnit = await Division.query()
        .select('id', 'unit_id')
        .where('id', divisionId)
        .first()

      const employeeIds: any = []

      employeeDivision.map(value => {
        employeeIds.push(value.$attributes.employeeId)
      })

      const data = await EmployeeUnit.query()
        .select('employee_id')
        .preload('employee', e => e.select('name'))
        .where('unit_id', checkUnit!.unitId)
        .andWhereNotIn('employee_id', employeeIds)
        .andWhereHas('employee', e => e
          .whereILike('name', `%${keyword}%`))
        .paginate(page, limit)

      response.ok({ message: "Data Berhasil Didapatkan", data });
    } catch (error) {
      const message = "HRDE08: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

}
