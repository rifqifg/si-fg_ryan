import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { TriwulanHelper } from 'App/Helpers/TriwulanHelper'
import { unitHelper } from 'App/Helpers/unitHelper'
import EmployeeUnit from 'App/Models/EmployeeUnit'
import Notification from 'App/Models/Notification'
import Triwulan from 'App/Models/Triwulan'
import TriwulanEmployee from 'App/Models/TriwulanEmployee'
import TriwulanEmployeeDetail from 'App/Models/TriwulanEmployeeDetail'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'
import CreateTriwulanValidator from 'App/Validators/CreateTriwulanValidator'
import UpdateTriwulanValidator from 'App/Validators/UpdateTriwulanValidator'
import { DateTime } from 'luxon'
import { validate as uuidValidation } from "uuid"
import { validator, schema, rules } from '@ioc:Adonis/Core/Validator'
import Unit from 'App/Models/Unit'
import Env from "@ioc:Adonis/Core/Env"
import Drive from '@ioc:Adonis/Core/Drive'
import User from 'App/Models/User'
import { RolesHelper } from 'App/Helpers/rolesHelper'

export default class TriwulansController {
  private async getSignedUrl(filename: string) {
    const beHost = Env.get('BE_URL')
    const hrdDrive = Drive.use('hrd')
    const signedUrl = beHost + await hrdDrive.getSignedUrl('units/' + filename, { expiresIn: '30mins' })
    return signedUrl
  }

  public async index({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { page = 1, limit = 10, keyword = "", fromDate = "", toDate = "" } = request.qs()
    const unitIds = await unitHelper()
    // const superAdmin = await checkRoleSuperAdmin()
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
      if (DateTime.fromISO(fromDate) > DateTime.fromISO(toDate)) {
        return response.badRequest({ message: "INVALID_DATE_RANGE" })
      }
      const data = await Triwulan.query()
        .whereILike('name', `%${keyword}%`)
        .andWhere(query => {
          if (fromDate && toDate) {
            query.whereBetween('from_date', [fromDate, toDate])
            query.orWhereBetween('to_date', [fromDate, toDate])
          }
        })
        .preload('unit', u => u.select('name'))
        .if(!roles.includes('super_admin') && !roles.includes('admin_foundation'), query => {
          query.whereIn('unit_id', unitIds)
        })
        .if(roles.includes('admin_foundation'), query => {
          query.whereHas('unit', u => u.where('foundation_id', user!.employee.foundationId))
        })
        .paginate(page, limit)


      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Data Berhasil Didapatkan", data })
    } catch (error) {
      const message = "HRDTW01: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const payload = await request.validate(CreateTriwulanValidator)

    if (payload.fromDate > payload.toDate) {
      return response.badRequest({ message: "INVALID_DATE_RANGE" })
    }

    try {
      const data = await Triwulan.create(payload);

      // push notifikasi ke member unit masing2 bahwa rapot triwulan sudah dibuat
      const listEmployeeUnit = await EmployeeUnit.query()
        .where('unit_id', payload.unitId)
        .preload('employee', e => e
          .select('id')
          .preload('user', u => u.
            select('id')))

      const listEmployeeUnitObject = JSON.parse(JSON.stringify(listEmployeeUnit))

      let listPushnotif: any = { notifications: [] }
      listEmployeeUnitObject.map(value => {
        if (value.employee.user) {
          listPushnotif.notifications.push({
            title: "Rapot Triwulan",
            description: `Rapot ${payload.name} telah dibuat`,
            date: DateTime.now().setZone('Asia/Jakarta').toFormat('yyyy-MM-dd HH:mm:ss').toString(),
            type: "triwulan",
            userId: value.employee.user.id
          })
        }
      })

      const CreateNotifValidator = await validator.validate({
        schema: schema.create({
          notifications: schema.array().members(
            schema.object().members({
              title: schema.string({}, [
                rules.minLength(3)
              ]),
              description: schema.string({}, [
                rules.minLength(3)
              ]),
              date: schema.date({ format: 'yyyy-MM-dd HH:mm:ss' }),
              type: schema.string(),
              userId: schema.string({}, [
                rules.exists({ table: 'users', column: 'id' })
              ])
            })
          )
        }),
        data: listPushnotif
      })

      await Notification.createMany(CreateNotifValidator.notifications)

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.created({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      const message = "HRDTW02: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async show({ request, response, params }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { page = 1, limit = 10, keyword = "", employeeId } = request.qs()

    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Triwulan ID tidak valid" });
    }

    let data

    try {
      const triwulan = await Triwulan.query()
        .where('id', id)
        .firstOrFail()
      if (!employeeId) {
        data = await TriwulanEmployee.query()
          .with('AggregatedData', query => {
            query
              .select('te.*')
              .select(Database.raw(`SUM(ted.skor) AS total_skor`))
              .select(Database.raw(`(select sum(skor) from triwulan_employee_details where triwulan_id = '${id}' and direct_supervisor = true and triwulan_employee_id = te.id) as total_skor_direct_supervisor`))
              .select(Database.raw(`(select sum(skor) from triwulan_employee_details where triwulan_id = '${id}' and direct_supervisor = false and triwulan_employee_id = te.id) as total_skor_indirect_supervisor`))
              .select(Database.raw(`(select TO_CHAR(from_date, 'Mon') || ' - ' || TO_CHAR(to_date, 'Mon YY') FROM triwulans where id = '${id}') AS period_of_assessment`))
              .select(Database.raw(`RANK() OVER (ORDER BY SUM(ted.skor) DESC) AS ranking`))
              .select(Database.raw(`(select name from employees e where id = te.employee_id) as employee_name`))
              .from(`triwulan_employees as te`)
              .where('triwulan_id', id)
              .joinRaw(`LEFT JOIN triwulan_employee_details ted ON ted.triwulan_employee_id = te.id`)
              .groupBy('te.id')
          })
          .preload('triwulan', tr => tr.preload('unit', u => u.select('id')))
          .preload('employee', e => e
            .select('id', 'name', 'nik')
            .select(Database.raw(`EXTRACT(YEAR FROM AGE((select to_date from triwulans where id = '${id}'), "date_in")) || ' tahun ' || EXTRACT(MONTH FROM AGE((select to_date from triwulans where id = '${id}'), "date_in")) || ' bulan' AS period_of_work`))
            .preload('divisions', ds => ds.select("title", "divisionId")
              .preload('division', d => d.select('name'))))
          .preload('triwulanEmployeeDetail', ted => ted
            .preload('assessmentComponent', ac => ac.select('name')))
          .select('*')
          .from('AggregatedData')
          .whereILike('employee_name', `%${keyword}%`)
          .orderBy('employee_name')
          .paginate(page, limit)

        const dataArrayObject = JSON.parse(JSON.stringify(data))

        let datas: any = []
        for (let i = 0; i < dataArrayObject.data.length; i++) {
          const result = await TriwulanHelper(dataArrayObject.data[i])
          const dataEmployee = { ...result.dataEmployee, triwulan: dataArrayObject.name }
          const triwulanEmployee = result.triwulanEmployee
          const triwulanEmployeeDetail = result.triwulanEmployeeDetail
          const penilai = result.penilai
          const dataUnit = await Unit.query()
            .select('id', 'signature', 'name')
            .where('id', triwulan.unitId)
            .preload('employeeUnits', eu =>
              eu
                .select('id', 'employee_id')
                .where('title', 'lead')
                .preload('employee', e => e.select('name')))
            .first()

          const dataUnitObject = {
            id: dataUnit?.id,
            name: dataUnit?.name,
            signature: dataUnit?.signature ? await this.getSignedUrl(dataUnit.signature) : null,
            unit_lead_employee_id: dataUnit!.employeeUnits.length > 0 ? dataUnit?.employeeUnits[0].employee.id : null,
            unit_lead_employee_name: dataUnit!.employeeUnits.length > 0 ? dataUnit?.employeeUnits[0].employee.name : null
          }

          datas.push({ dataEmployee, triwulanEmployee, triwulanEmployeeDetail, penilai, dataUnit: dataUnitObject })
        }

        CreateRouteHist(statusRoutes.FINISH, dateStart)
        return response.ok({ message: "Data Berhasil Didapatkan", triwulan, data: { meta: dataArrayObject.meta, data: datas } })
      } else {
        //buat module profile dan triwulan employee detail
        data = await TriwulanEmployee.query()
          .with('AggregatedData', query => {
            query
              .select('te.*')
              .select(Database.raw(`SUM(ted.skor) AS total_skor`))
              .select(Database.raw(`(select sum(skor) from triwulan_employee_details where triwulan_id = '${id}' and direct_supervisor = true and triwulan_employee_id = te.id) as total_skor_direct_supervisor`))
              .select(Database.raw(`(select sum(skor) from triwulan_employee_details where triwulan_id = '${id}' and direct_supervisor = false and triwulan_employee_id = te.id) as total_skor_indirect_supervisor`))
              .select(Database.raw(`(select TO_CHAR(from_date, 'Mon') || ' - ' || TO_CHAR(to_date, 'Mon YY') FROM triwulans where id = '${id}') AS period_of_assessment`))
              .select(Database.raw(`RANK() OVER (ORDER BY SUM(ted.skor) DESC) AS ranking`))
              .select(Database.raw(`(select name from employees e where id = te.employee_id) as employee_name`))
              .from(`triwulan_employees as te`)
              .where('triwulan_id', id)
              .joinRaw(`LEFT JOIN triwulan_employee_details ted ON ted.triwulan_employee_id = te.id`)
              .groupBy('te.id')
          })
          .preload('triwulan', tr => tr.preload('unit', u => u.select('id')))
          .preload('employee', e => e
            .select('name', 'nik')
            .select(Database.raw(`EXTRACT(YEAR FROM AGE((select to_date from triwulans where id = '${id}'), "date_in")) || ' tahun ' || EXTRACT(MONTH FROM AGE((select to_date from triwulans where id = '${id}'), "date_in")) || ' bulan' AS period_of_work`))
            .preload('divisions', ds => ds.select("title", "divisionId")
              .preload('division', d => d.select('name'))))
          .preload('triwulanEmployeeDetail', ted => ted
            .preload('assessmentComponent', ac => ac.select('name')))
          .select('*')
          .from('AggregatedData')
          .where('employee_id', employeeId)

        const dataArrayObject = JSON.parse(JSON.stringify(data))

        let datas: any = []
        for (let i = 0; i < dataArrayObject.length; i++) {
          const result = await TriwulanHelper(dataArrayObject[i])
          const dataEmployee = { ...result.dataEmployee, triwulan: dataArrayObject.name }
          const triwulanEmployee = result.triwulanEmployee
          const triwulanEmployeeDetail = result.triwulanEmployeeDetail
          const penilai = result.penilai
          const dataUnit = await Unit.query()
            .select('id', 'signature')
            .where('id', triwulan.unitId)
            .preload('employeeUnits', eu =>
              eu
                .select('id', 'employee_id')
                .where('title', 'lead')
                .preload('employee', e => e.select('name')))
            .first()

          const dataUnitObject = {
            id: dataUnit?.id,
            name: dataUnit?.name,
            signature: dataUnit?.signature ? await this.getSignedUrl(dataUnit.signature) : null,
            unit_lead_employee_id: dataUnit?.employeeUnits[0].employee.id,
            unit_lead_employee_name: dataUnit?.employeeUnits[0].employee.name
          }

          datas.push({ dataEmployee, triwulanEmployee, triwulanEmployeeDetail, penilai, dataUnit: dataUnitObject })
        }
        const { dataEmployee, triwulanEmployee, triwulanEmployeeDetail, penilai, dataUnit } = datas[0]

        CreateRouteHist(statusRoutes.FINISH, dateStart)
        return response.ok({ message: "Data Berhasil Didapatkan", dataEmployee, triwulanEmployee, triwulanEmployeeDetail, penilai, dataUnit })
      }
    } catch (error) {
      const message = "HRDTW03: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async update({ params, request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Triwulan ID tidak valid" });
    }

    const payload = await request.validate(UpdateTriwulanValidator);
    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }
    if (payload.fromDate! > payload.toDate!) {
      return response.badRequest({ message: "INVALID_DATE_RANGE" })
    }

    try {
      const triwulan = await Triwulan.findOrFail(id);

      // cek lead unit
      const user = await User.query()
        .preload('employee', e => e
          .select('id', 'name', 'foundation_id'))
        .preload('roles', r => r
          .preload('role'))
        .where('employee_id', auth.user!.$attributes.employeeId)
        .first()
      const userObject = JSON.parse(JSON.stringify(user))

      const roles = await RolesHelper(userObject)
      if (!roles.includes('super_admin') && !roles.includes('admin_foundation')) {
        const unitLead = await EmployeeUnit.query()
          .where('employee_id', auth.user!.$attributes.employeeId)
          .andWhere('title', 'lead')
          .first()
        if (unitLead?.unitId !== triwulan.unitId) {
          return response.badRequest({ message: "Gagal update rapot triwulan dikarenakan anda bukan ketua unit tersebut" });
        }
      }

      const data = await triwulan.merge(payload).save();
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "HRDTW04: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengubah data",
        error: message,
        error_data: error,
      });
    }
  }

  public async destroy({ params, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Triwulan ID tidak valid" });
    }

    try {
      const data = await Triwulan.findOrFail(id);

      // cek lead unit
      const user = await User.query()
        .preload('employee', e => e
          .select('id', 'name', 'foundation_id'))
        .preload('roles', r => r
          .preload('role'))
        .where('employee_id', auth.user!.$attributes.employeeId)
        .first()
      const userObject = JSON.parse(JSON.stringify(user))

      const roles = await RolesHelper(userObject)
      if (!roles.includes('super_admin') && !roles.includes('admin_foundation')) {
        const unitLead = await EmployeeUnit.query()
          .where('employee_id', auth.user!.$attributes.employeeId)
          .andWhere('title', 'lead')
          .first()
        if (unitLead?.unitId !== data.unitId) {
          return response.badRequest({ message: "Gagal hapus rapot triwulan dikarenakan anda bukan ketua unit tersebut" });
        }
      }

      await data.delete();
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      const message = "HRDTW05: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }

  public async recaps({ params, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { id } = params; // triwulan id
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Triwulan ID tidak valid" });
    }

    try {
      const triwulan = await Triwulan.query()
        .where('id', id)
        .firstOrFail()

      const data = await TriwulanEmployeeDetail.query()
        .select('assessment_component_id')
        .select(Database.raw(`sum(skor) as total_skor`))
        .select(Database.raw(`RANK() OVER (ORDER BY SUM(skor) DESC) AS ranking`))
        .whereHas('triwulanEmployee', te => te.where('triwulan_id', id))
        .preload('assessmentComponent', ac => ac.select('*'))
        .groupBy('assessment_component_id')

      const dataArrayObject = JSON.parse(JSON.stringify(data))

      const groupedCategory = dataArrayObject.reduce((acc, obj) => {
        const category = obj.assessmentComponent.category;

        if (!acc[category]) {
          acc[category] = [];
        }

        const newObj = { ...obj, name: obj.assessmentComponent.name };
        delete newObj.assessmentComponent;

        acc[category].push(newObj);
        return acc;
      }, {});

      response.ok({ message: "Data Berhasil Didapatkan", triwulan, data: groupedCategory })
    } catch (error) {
      const message = "HRDTW06: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }
}
