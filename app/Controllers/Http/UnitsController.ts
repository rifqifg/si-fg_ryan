import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { checkRoleSuperAdmin } from "App/Helpers/checkRoleSuperAdmin";
import { unitHelper } from "App/Helpers/unitHelper";
import Unit from "App/Models/Unit";
import Env from "@ioc:Adonis/Core/Env"
import Drive from '@ioc:Adonis/Core/Drive'
import CreateUnitValidator from "App/Validators/CreateUnitValidator";
import UpdateUnitValidator from "App/Validators/UpdateUnitValidator";
import { DateTime } from "luxon";
import { validate as uuidValidation } from "uuid"
import User from "App/Models/User";
import { RolesHelper } from "App/Helpers/rolesHelper";

export default class UnitsController {

  private async getSignedUrl(filename: string) {
    const beHost = Env.get('BE_URL')
    const hrdDrive = Drive.use('hrd')
    const signedUrl = beHost + await hrdDrive.getSignedUrl('units/' + filename, { expiresIn: '30mins' })
    return signedUrl
  }

  public async index({ request, response, auth }: HttpContextContract) {
    // const dateStart = DateTime.now().toMillis();
    // CreateRouteHist(statusRoutes.START, dateStart);
    const { page = 1, limit = 10, keyword = "", foundationId } = request.qs();
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

    try {
      const data = await Unit.query()
        .preload("employeeUnits", (e) => {
          e.select("id", "title", "employee_id");
          e.preload("employee", (m) => m.select("name"));
          e.where("title", "=", "lead");
        })
        .preload('foundation', f => f.select('name'))
        .whereILike("name", `%${keyword}%`)
        .if(!roles.includes('super_admin') && !roles.includes('admin_foundation'), query => query
          .whereIn('id', unitIds)
          .where('foundation_id', user!.employee.foundationId)
        )
        .if(roles.includes('admin_foundation'), query => query
          .where('foundation_id', user!.employee.foundationId)
        )
        .if(roles.includes('super_admin') && foundationId, query => query
          .where('foundation_id', foundationId))
        .orderBy('name', 'asc')
        .paginate(page, limit);

      const dataObject = JSON.parse(JSON.stringify(data))

      dataObject.data.map(async (value) => {
        if (value.signature) {
          value.signature = await this.getSignedUrl(value.signature)
        }
      })
      // CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({ message: "Data Berhasil Didapatkan", data: dataObject });
    } catch (error) {
      const message = "HRDU01: " + error.message || error;
      // CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async store({ request, response, auth }: HttpContextContract) {
    const payload = await request.validate(CreateUnitValidator);

    try {
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

      let data
      if (payload.signature) {
        const signature = Math.floor(Math.random() * 1000) + DateTime.now().toUnixInteger().toString() + "." + payload.signature.extname
        await payload.signature.moveToDisk(
          'units',
          { name: signature, overwrite: true },
          'hrd'
        )

        data = await Unit.create({ ...payload, signature })
        data.signature = await this.getSignedUrl(data.signature)
      } else {
        data = await Unit.create({
          name: payload.name,
          description: payload.description,
          foundationId: payload.foundationId
        })
      }

      // const data = await Unit.create(payload);
      response.ok({ message: "Create data success", data });
    } catch (error) {
      const message = "HRDU02: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal create data",
        error: message,
        error_data: error,
      });
    }
  }

  public async show({ params, response, request }: HttpContextContract) {
    const { keyword = "", page = 1, limit = 10 } = request.qs();
    const { id } = params;

    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Unit ID tidak valid" });
    }

    try {
      const data = await Unit.query()
        .where("id", id)
        .preload("employeeUnits", (e) => {
          e.select("id", "title", "employee_id", "status");
          e.preload("employee", (m) => m.select("name"));
          e.whereHas('employee', e => e.whereILike("name", `%${keyword}%`))
          e.orderByRaw(`
            case
              when title = 'lead' then 1
              when title = 'vice' then 2
              else 3
            end
          `)
            .forPage(page, limit)
        })
        .preload('foundation', f => f.select('name'))
        .withCount('employeeUnits')
        .firstOrFail();

      const dataObject = JSON.parse(JSON.stringify(data))

      if (dataObject.signature) {
        dataObject.signature = await this.getSignedUrl(dataObject.signature)
      }

      response.ok({ message: "Get data success", data: dataObject });
    } catch (error) {
      const message = "HRDU03: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil detail data",
        error: message,
        error_data: error,
      });
    }
  }

  public async update({ request, response, params, auth }: HttpContextContract) {
    const { id } = params;

    const payload = await request.validate(UpdateUnitValidator);
    const objectPayload = JSON.parse(JSON.stringify(payload))
    const user = await User.query().preload('roles', r => r.preload('role')).where('id', auth.use('api').user!.id).firstOrFail()
    const userObject = JSON.parse(JSON.stringify(user))
    const roles = await RolesHelper(userObject)

    if (!roles.includes('super_admin') && !roles.includes('admin_foundation')) {
      //cek unit, apakah user yg login adalah lead atau bukan
      const checkUnit = await Unit.query()
        .whereHas('employeeUnits', eu => eu
          .where('employee_id', auth.user!.$attributes.employeeId)
          .andWhere('title', 'lead'))
        .first()

      if (!checkUnit || checkUnit.id != id) {
        return response.badRequest({ message: "Gagal mengubah data unit dikarenakan anda bukan ketua" });
      }
    }

    try {
      const unit = await Unit.findOrFail(id);

      if (payload.signature) {
        const image = Math.floor(Math.random() * 1000) + DateTime.now().toUnixInteger().toString() + "." + payload.signature.extname
        await payload.signature.moveToDisk(
          'units',
          { name: image, overwrite: true },
          'hrd'
        )
        if (unit.signature) {
          await Drive.use('hrd').delete('units/' + unit.signature)
        }

        objectPayload.signature = image
      }

      const data = await unit.merge(objectPayload).save();
      if (data.signature) {
        data.signature = await this.getSignedUrl(data.signature)
      }

      response.ok({ message: "Update data success", data });
    } catch (error) {
      const message = "HRDU04: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal update data",
        error: message,
        error_data: error,
      });
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params;
    try {
      const data = await Unit.findOrFail(id);
      await data.delete();

      if (data.signature) {
        await Drive.use('hrd').delete('units/' + data.signature)
      }

      response.ok({ message: "Delete data success" });
    } catch (error) {
      const message = "HRDU05: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }

  public async getUnit({ request, response, auth }: HttpContextContract) {
    const { keyword = "" } = request.qs()

    try {
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
      const data = await Unit.query()
        .whereILike('name', `%${keyword}%`)
        .preload('employeeUnits', eu => eu.where('title', 'lead').andWhere('employee_id', auth.user!.$attributes.employeeId))
        .if(!roles.includes('super_admin') && !roles.includes('admin_foundation'), query => {
          query.whereIn('id', unitIds)
        })
        .if(roles.includes('admin_foundation'), query => {
          query.where('foundation_id', user!.employee.foundationId)
        })

      response.ok({ message: "get data successfully", data })
    } catch (error) {
      const message = "HRDU06: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  // get data unit hanya yg di ketuai user yg sdg login
  public async getUnitLeadOnly({ request, response, auth }: HttpContextContract) {
    const { keyword = "" } = request.qs()

    try {
      const unitIds = await unitHelper()
      const superAdmin = await checkRoleSuperAdmin()

      const data = await Unit.query()
        .whereILike('name', `%${keyword}%`)
        .preload('employeeUnits', eu => eu.where('title', 'lead').andWhere('employee_id', auth.user!.$attributes.employeeId))
        .if(!superAdmin, query => {
          query.whereIn('id', unitIds)
          query.whereHas('employeeUnits', eu => eu.where('title', 'lead').andWhere('employee_id', auth.user!.$attributes.employeeId))
        })

      response.ok({ message: "get data successfully", data })
    } catch (error) {
      const message = "HRDU07: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async deleteImage({ params, response }: HttpContextContract) {
    const { id } = params;
    try {
      const data = await Unit.findOrFail(id);

      if (data.signature) {
        await Drive.use('hrd').delete('units/' + data.signature)
      }

      await data.merge({ signature: null }).save()
      response.ok({ message: "Delete unit image success" });
    } catch (error) {
      const message = "HRDU08: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }
}
