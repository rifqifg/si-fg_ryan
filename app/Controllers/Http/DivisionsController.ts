import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Division from 'App/Models/Division'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'
import { DateTime } from 'luxon'
import { unitHelper } from 'App/Helpers/unitHelper'
import { checkRoleSuperAdmin } from 'App/Helpers/checkRoleSuperAdmin'
import EmployeeUnit from 'App/Models/EmployeeUnit'
import User from 'App/Models/User'
import { RolesHelper } from 'App/Helpers/rolesHelper'


export default class DivisionsController {
  public async index({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { page = 1, limit = 10, keyword = "", orderBy = "name", orderDirection = 'ASC' } = request.qs()
    const unitIds = await unitHelper()
    const user = await User.query()
      .preload('employee', e => e
        .select('id', 'name', 'foundation_id'))
      .preload('roles', r => r
        .preload('role'))
      .where('employee_id', auth.user!.$attributes.employeeId)
      .first()
    const userObject = JSON.parse(JSON.stringify(user))
    const roles = await RolesHelper(userObject)

    const data = await Division.query()
      .preload('employees', e => {
        e.select('title', 'employee_id')
        e.preload('employee', m => m.select('name'))
        e.where('title', '=', 'lead')
      })
      .preload('unit', u => u.select('name'))
      .whereILike('name', `%${keyword}%`)
      .if(!roles.includes('super_admin') && !roles.includes('admin_foundation'), query => {
        query.whereIn('unit_id', unitIds)
      })
      .if(roles.includes('admin_foundation'), query => {
        query.whereHas('unit', u => u.where('foundation_id', user!.employee.foundationId))
      })
      .orderBy(orderBy, orderDirection)
      .paginate(page, limit)

    CreateRouteHist(statusRoutes.FINISH, dateStart)
    response.ok({ message: "Data Berhasil Didapatkan", data })
  }

  public async getDivision({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { keyword = "" } = request.qs()
    const unitIds = await unitHelper()
    const superAdmin = await checkRoleSuperAdmin()
    try {
      const data = await Division.query()
        .whereILike('name', `%${keyword}%`)
        .if(!superAdmin, query => {
          query.whereIn('unit_id', unitIds)
        })
        .orderBy('name')

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Get Data Success", data })
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      console.log(error);
      response.badRequest(error)
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const createNewDivisionSchema = schema.create({
      name: schema.string({ trim: true }, [
        rules.minLength(2)
      ]),
      description: schema.string.optional({}, [rules.minLength(6)]),
      unitId: schema.string({}, [
        rules.exists({ table: 'units', column: 'id' })
      ]),
    })

    const payload = await request.validate({ schema: createNewDivisionSchema })

    try {
      const data = await Division.create(payload)
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Create data success", data })
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      console.log(error);
      return response.internalServerError(error)
    }
  }

  public async show({ params, response, request }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { id } = params
    const { keyword = "" } = request.qs();

    try {
      const data = await Division.query()
        .preload('employees', e => {
          e.select('title', 'employee_id')
          e.preload('employee', m => m.select('name'))
          e.whereHas('employee', e => e.whereILike("name", `%${keyword}%`))
          e.orderByRaw(`
            case
              when title = 'lead' then 1
              when title = 'vice' then 2
              else 3
            end
          `)
        })
        .where('id', id)
        .firstOrFail()

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Get data success", data })
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      console.log(error);
      return response.internalServerError(error)
    }
  }

  public async edit({ }: HttpContextContract) { }

  public async update({ request, response, params, auth }: HttpContextContract) {

    const { id } = params
    const createNewDivisionSchema = schema.create({
      name: schema.string.optional({ trim: true }, [
        rules.minLength(2)
      ]),
      description: schema.string.optional({}, [rules.minLength(6)]),
      unitId: schema.string.optional({}, [
        rules.exists({ table: 'units', column: 'id' })
      ]),
    })

    const payload = await request.validate({ schema: createNewDivisionSchema })

    try {

      const data = await Division.findOrFail(id)

      // cek lead unit
      const superAdmin = await checkRoleSuperAdmin()
      if (!superAdmin) {
        const unitLead = await EmployeeUnit.query()
          .where('employee_id', auth.user!.$attributes.employeeId)
          .andWhere('title', 'lead')
          .first()
        if (unitLead?.unitId !== data.unitId) {
          return response.badRequest({ message: "Gagal update status izin dikarenakan anda bukan ketua unit tersebut" });
        }
      }

      await data.merge(payload).save()

      response.ok({ message: "Update data success", data })
    } catch (error) {
      console.log(error);

      return response.internalServerError({ ...error })
    }
  }

  public async destroy({ params, response, auth }: HttpContextContract) {
    const { id } = params
    try {
      const data = await Division.findOrFail(id)

      // cek lead unit
      const superAdmin = await checkRoleSuperAdmin()
      if (!superAdmin) {
        const unitLead = await EmployeeUnit.query()
          .where('employee_id', auth.user!.$attributes.employeeId)
          .andWhere('title', 'lead')
          .first()
        if (unitLead?.unitId !== data.unitId) {
          return response.badRequest({ message: "Gagal update status izin dikarenakan anda bukan ketua unit tersebut" });
        }
      }

      await data.delete()

      response.ok({ message: "Delete data success" })
    } catch (error) {
      console.log(error);
      response.internalServerError(error)
    }
  }
}
