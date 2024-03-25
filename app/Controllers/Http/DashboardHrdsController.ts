import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { RolesHelper } from 'App/Helpers/rolesHelper'
import Employee from 'App/Models/Employee'
import Leave from 'App/Models/Leave'
import Presence from 'App/Models/Presence'
import User from 'App/Models/User'
import { DateTime } from 'luxon'

const mergeArraysByDate = (sample_a, sample_b) => {
  // Objek untuk menyimpan data gabungan
  const mergedData = {};

  // Menambahkan data dari sample_a ke dalam objek mergedData
  sample_a.forEach(item => {
    mergedData[item.date] = {
      ...mergedData[item.date],
      ...item
    };
  });

  // Menambahkan data dari sample_b ke dalam objek mergedData
  sample_b.forEach(item => {
    mergedData[item.date] = {
      ...mergedData[item.date],
      ...item
    };
  });

  // Mengubah objek mergedData menjadi array
  const mergedArray = Object.keys(mergedData).map(date => mergedData[date]);

  // Mengurutkan array berdasarkan tanggal
  mergedArray.sort((a, b) => {
    const dateA = DateTime.fromISO(a.date);
    const dateB = DateTime.fromISO(b.date);
    return dateA.diff(dateB).milliseconds;
  });

  return mergedArray;
}

const calculatePercentage = (value, totalAllPresence) => {
  const percentage = (value / totalAllPresence) * 100;

  return Math.round(percentage * 10) / 10;
}

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

  public async totalEmployee({ auth, response, request }: HttpContextContract) {
    /*
       - user_hrd gak ngehit api ini
       - super_admin dan admin_foundation ada pilihan unitId
       - admin_hrd, unitId ngambil lead_unit
    */
    const { unitId } = request.qs()
    try {
      const user = await User.query()
        .preload('employee', e => e
          .select('id', 'name', 'foundation_id')
          .preload('employeeUnits', eu => eu
            .select('id', 'unit_id')
            .where('title', 'lead')
          ))
        .preload('roles', r => r
          .preload('role'))
        .where('employee_id', auth.user!.$attributes.employeeId)
        .first()

      const userObject = JSON.parse(JSON.stringify(user))
      const roles = await RolesHelper(userObject)

      const employeeStatusCounts = await Employee.query()
        .select([
          Database.raw(`count(CASE WHEN status = 'PART_TIME' THEN id END) as part_time`),
          Database.raw(`count(CASE WHEN status = 'FULL_TIME' THEN id END) as full_time`)
        ])
        .if(!roles.includes('super_admin'), query => query
          .where('foundation_id', user!.employee.foundationId)
        )
        .if(unitId && (roles.includes('super_admin') || roles.includes('admin_foundation')), query => query
          .andWhereHas('employeeUnits', eu => eu
            .where('unit_id', unitId))
        )
        .if(roles.includes('admin_hrd'), query => query
          .andWhereHas('employeeUnits', eu => eu
            .where('unit_id', userObject!.employee.employeeUnits[0].unit_id))
        )
        .andWhereNull('date_out')
        .first();

      response.ok({ message: 'get data successfully', data: employeeStatusCounts })
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
    let { fromDate, toDate, unitId, activityId } = request.qs()
    let formattedStartDate
    let formattedEndDate

    if (!fromDate || !toDate) {
      fromDate = DateTime.now().minus({ days: 7 }).toISODate()?.toString(),
        toDate = DateTime.now().toISODate()?.toString()

      const splittedFromDate = fromDate.split(" ")[0];
      const splittedToDate = toDate.split(" ")[0];

      formattedStartDate = `${splittedFromDate ? splittedFromDate : fromDate
        } 00:00:00.000 +0700`;
      formattedEndDate = `${splittedToDate ? splittedToDate : toDate
        } 23:59:59.000 +0700`;
    } else {
      const splittedFromDate = fromDate.split(" ")[0];
      const splittedToDate = toDate.split(" ")[0];

      formattedStartDate = `${splittedFromDate ? splittedFromDate : fromDate
        } 00:00:00.000 +0700`;
      formattedEndDate = `${splittedToDate ? splittedToDate : toDate
        } 23:59:59.000 +0700`;
    }

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

      // const total_employees = await Employee.query()
      //   .count('id', 'total_employees')
      //   .where('foundation_id', user!.employee.foundationId)
      //   .andWhereHas('employeeUnits', eu => eu.where('unit_id', userObject!.employee.employeeUnits[0].unit_id))
      //   .andWhereNull('date_out')
      //   .first()

      const employeeIds = await Employee.query()
        .select('id', 'name')
        .if(!roles.includes('super_admin'), query => query
          .where('foundation_id', user!.employee.foundationId)
        )
        .if(roles.includes('admin_hrd') && !unitId, query => query
          .andWhereHas('employeeUnits', eu => eu.where('unit_id', userObject!.employee.employeeUnits[0].unit_id))
        )
        .if(unitId && (roles.includes('super_admin') || roles.includes('admin_foundation')), query => query
          .andWhereHas('employeeUnits', eu => eu.where('unit_id', unitId))
        )
        .if(roles.includes('user_hrd') && !roles.includes('admin_hrd'), query => query
          .andWhere('id', user!.employeeId)
        )
        .andWhereNull('date_out')

      //total presence hadir
      const totalPresence = await Presence.query()
        .select([
          Database.raw(`count(time_in)::int as hadir`),
          Database.raw(`TO_CHAR(DATE_TRUNC('day', time_in), 'YYYY-MM-DD') AS date`)
        ])
        .whereIn('employee_id', employeeIds.map(item => item.id))
        .andWhere(query => query
          .whereBetween('time_in', [formattedStartDate, formattedEndDate])
          .orWhereBetween('time_out', [formattedStartDate, formattedEndDate])
        )
        .andWhereHas('activity', a => a
          .where('activity_type', 'fixed_time')
          .if(activityId, query => query
            .where('id', activityId)
          )
        )
        .groupByRaw(`DATE_TRUNC('day', time_in)`)

      //total presence izin, sakit, cuti
      const countLeave = await Leave.query()
        .select([
          Database.raw(`count(CASE WHEN leave_status = 'izin' THEN id END)::int as izin`),
          Database.raw(`count(CASE WHEN leave_status = 'sakit' THEN id END)::int as sakit`),
          Database.raw(`count(CASE WHEN leave_status = 'cuti' THEN id END)::int as cuti`),
          Database.raw(`TO_CHAR(GENERATE_SERIES(from_date::timestamp, to_date::timestamp, '1 day')::date, 'YYYY-MM-DD') as date`),
        ])
        .whereIn('employee_id', employeeIds.map(item => item.id))
        .andWhere(query => query
          .whereBetween('from_date', [formattedStartDate, formattedEndDate])
          .orWhereBetween('to_date', [formattedStartDate, formattedEndDate])
        )
        .andWhere(query => query
          .where('status', 'aprove')
          .orWhere('status', 'waiting')
        )
        .groupByRaw(`date`)
        .orderByRaw(`date`);

      //menggabungkan absen bedasarkan date nya
      const mergedData = mergeArraysByDate(JSON.parse(JSON.stringify(totalPresence)), JSON.parse(JSON.stringify(countLeave)))

      //menghitung
      let result: any[] = []
      mergedData.forEach(value => {
        console.log(value);
        const hadir = value.hadir ? value.hadir : 0
        const cuti = value.cuti ? value.cuti : 0
        const sakit = value.sakit ? value.sakit : 0
        const izin = value.izin ? value.izin : 0

        const totalAllPresence = hadir + cuti + sakit + izin

        const data = [
          {
            date: value.date,
            name: "hadir",
            value: calculatePercentage(hadir, totalAllPresence),
          },
          {
            date: value.date,
            name: "cuti",
            value: calculatePercentage(cuti, totalAllPresence),
          },
          {
            date: value.date,
            name: "sakit",
            value: calculatePercentage(sakit, totalAllPresence),
          },
          {
            date: value.date,
            name: "izin",
            value: calculatePercentage(izin, totalAllPresence)
          },
        ]

        data.forEach(d => {
          result.push(d)
        })
      })

      response.ok({ message: "get data successfully", data: result })
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
