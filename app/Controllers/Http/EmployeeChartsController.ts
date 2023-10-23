import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'

export default class EmployeeChartsController {
  public async karyawanKehadiran({ request, response }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const tableSyncPresences = 'presences'
    const activityId = '02d5b9cc-1a1c-43a2-9bbb-2e291e7a6e90'

    const getLastDates = `
      select distinct cast(time_in::date as varchar) tanggal
      from ${tableSyncPresences}
      where time_in is not null
          and EXTRACT(ISODOW FROM time_in::date) < 6
      order by cast(time_in::date as varchar) desc
      limit 7
    `

    const { rows: lastDates } = await Database.rawQuery(getLastDates)
    const startDate = lastDates[lastDates.length - 1].tanggal
    const endDate = lastDates[0].tanggal


    const getLastMonths = `
      select distinct substring(cast(time_in::date as varchar),0,8) tanggal
      from ${tableSyncPresences}
      where time_in is not null
      order by substring(cast(time_in::date as varchar),0,8) desc
      limit 3
    `

    const { rows: lastMonths } = await Database.rawQuery(getLastMonths)
    const startMonth = lastMonths[lastMonths.length - 1].tanggal
    const endMonth = lastMonths[0].tanggal

    const selectDaily = `
      select tanggal
          , total
          ,concat((100 * total / total_employees)::integer,'%') precentage
            ,total_employees
      from (
            select time_in::date tanggal
              , count(p.id) total
              , count(distinct p.time_in::date) total_days
            from presences p
            where p.activity_id = '${activityId}'
              and time_in::date between '${startDate}' and '${endDate}'
              and EXTRACT(ISODOW FROM time_in::date) < 6
            group by time_in::date
      )p
      ,(
          select count(id) total_employees
          from employees e
          where e.scan_presence_required is true
            and e.date_out is null
      ) e

      order by tanggal
    `

    const selectMonthly = `
      select bulan, total
      ,concat((100 * total / (total_days * total_employees))::integer,'%') precentage
      , total_days, total_employees
      from (
      select substring(cast(time_in::date as varchar),0,8) bulan
      , count(p.id) total
      , count(distinct p.time_in::date) total_days
      from presences p
      where p.activity_id = '${activityId}'
        and substring(cast(time_in::date as varchar),0,8) between '${startMonth}' and '${endMonth}'
        and EXTRACT(ISODOW FROM time_in::date) < 6
      group by substring(cast(time_in::date as varchar),0,8)
      )p
      ,(
      select count(id) total_employees
      from employees e
      where e.scan_presence_required is true
        and e.date_out is null
      ) e
      order by bulan
    `

    try {
      const { rows: dataHarian } = await Database.rawQuery(selectDaily)
      const { rows: dataBulanan } = await Database.rawQuery(selectMonthly)
      CreateRouteHist(request, statusRoutes.FINISH)
      response.ok({
        message: "Berhasil menghitung data kehadiran karyawan",
        dataHarian,
        dataBulanan,
      })
    } catch (error) {
      CreateRouteHist(request, statusRoutes.ERROR, error.message || error)
      console.log(error);
      return response.internalServerError({
        message: 'ECHR64: Gagal Menghitung Data kehadiran karyawan',
        error: error.message || error
      })

    }
  }

  public async create({ }: HttpContextContract) { }

  public async store({ }: HttpContextContract) { }

  public async show({ }: HttpContextContract) { }

  public async edit({ }: HttpContextContract) { }

  public async update({ }: HttpContextContract) { }

  public async destroy({ }: HttpContextContract) { }
}
