import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { RolesHelper } from 'App/Helpers/rolesHelper'
import Employee from 'App/Models/Employee'
import Leave from 'App/Models/Leave'
import Presence from 'App/Models/Presence'
import User from 'App/Models/User'
import { DateTime } from 'luxon'

export default class DashboardHrdsController {
  public async statusEmployee({ auth, response }: HttpContextContract) {
    try {
      const data = await Employee.query()
        .select('id', 'name', 'default_presence')
        .select(Database.raw(`EXTRACT(YEAR FROM AGE(CURRENT_DATE, "date_in")) || ' tahun ' || EXTRACT(MONTH FROM AGE(CURRENT_DATE, "date_in")) || ' bulan' AS period_of_work`))
        .where('id', auth.user!.$attributes.employeeId)
        .preload('employeeUnits', eu => eu
          .select('id', 'unit_id', 'title', 'status')
          .preload('unit', u => u.select('name')))
        .first()

      return response.ok({ message: "get data successfully", data })
    } catch (error) {
      const message = "HRDDASH01: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async totalEmployee({ auth, response }: HttpContextContract) {
    try {
      const user = await User.query()
        .preload('employee', e => e
          .select('id', 'name', 'foundation_id'))
        .preload('roles', r => r
          .preload('role'))
        .where('employee_id', auth.user!.$attributes.employeeId)
        .first()

      const employmentStatusCounts = await Employee.query()
        .select([
          Database.raw(`count(CASE WHEN status = 'PART_TIME' THEN id END) as part_time`),
          Database.raw(`count(CASE WHEN status = 'FULL_TIME' THEN id END) as full_time`)
        ])
        .where('foundation_id', user!.employee.foundationId)
        .andWhereNull('date_out')
        .first();

      response.ok({ message: 'get data successfully', data: employmentStatusCounts })
    } catch (error) {
      const message = "HRDDASH02: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async attendancePercentage({ auth, response, request }: HttpContextContract) {
    const {
      fromDate = DateTime.now().minus({ days: 8 }).toISODate()?.toString(),
      toDate = DateTime.now().plus({ days: 1 }).toISODate()?.toString()
    } = request.qs()
    console.log(fromDate, toDate);

    try {
      // cek role
      const user = await User.query()
        .preload('employee', e => e
          .select('id', 'name', 'foundation_id')
          .preload('employeeUnits', eu => eu
            .select('id', 'unit_id')
            .where('title', 'lead')
          )
        )
        .preload('roles', r => r
          .preload('role'))
        .where('employee_id', auth.user!.$attributes.employeeId)
        .first()
      const userObject = JSON.parse(JSON.stringify(user))
      const roles = await RolesHelper(userObject)

      if (roles.includes('admin_hrd')) {
        // const total_employees = await Employee.query()
        //   .count('id', 'total_employees')
        //   .where('foundation_id', user!.employee.foundationId)
        //   .andWhereHas('employeeUnits', eu => eu.where('unit_id', userObject!.employee.employeeUnits[0].unit_id))
        //   .andWhereNull('date_out')
        //   .first()

        const employeeIds = await Employee.query()
          .select('id', 'name')
          .where('foundation_id', user!.employee.foundationId)
          .andWhereHas('employeeUnits', eu => eu.where('unit_id', userObject!.employee.employeeUnits[0].unit_id))
          .andWhereNull('date_out')


        //total presence hadir
        const totalPresence = await Presence.query()
          .count('id', 'presence_count')
          .whereIn('employee_id', employeeIds.map(item => item.id))
          .whereBetween('time_in', [fromDate, toDate])
          .orWhereBetween('time_out', [fromDate, toDate])
          .andWhereHas('activity', a => a.where('unit_id', userObject!.employee.employeeUnits[0].unit_id))

        //total presence izin, sakit, cuti
        const countLeave = await Leave.query()
          .select([
            Database.raw(`count(CASE WHEN leave_status = 'izin' THEN id END) as izin`),
            Database.raw(`count(CASE WHEN leave_status = 'sakit' THEN id END) as sakit`),
            Database.raw(`count(CASE WHEN leave_status = 'cuti' THEN id END) as cuti`)
          ])
          .whereIn('employee_id', employeeIds.map(item => item.id))
          .whereBetween('from_date', [fromDate, toDate])
          .orWhereBetween('to_date', [fromDate, toDate])
          .first();

        //menghitung persen
        const totalAllPresence = parseInt(totalPresence[0].$extras.presence_count) + parseInt(countLeave?.$extras.sakit) + parseInt(countLeave?.$extras.izin) + parseInt(countLeave?.$extras.cuti)
        const presencePercentage = parseInt(totalPresence[0].$extras.presence_count) / totalAllPresence * 100
        const sakitPercentage = parseInt(countLeave?.$extras.sakit) / totalAllPresence * 100
        const izinPercentage = parseInt(countLeave?.$extras.izin) / totalAllPresence * 100
        const cutiPercentage = parseInt(countLeave?.$extras.cuti) / totalAllPresence * 100
        return response.ok({
          message: 'get data successfully',
          data: {presencePercentage, cutiPercentage, sakitPercentage, izinPercentage},
          details: {
            hadir: parseInt(totalPresence[0].$extras.presence_count),
            cuti: parseInt(countLeave?.$extras.cuti),
            sakit: parseInt(countLeave?.$extras.sakit),
            izin: parseInt(countLeave?.$extras.izin),
          }
        })
      }
    } catch (error) {
      const message = "HRDDASH03: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }
}
