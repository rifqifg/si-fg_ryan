import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Activity from 'App/Models/Activity'
import Employee from 'App/Models/Employee'
import Presence from 'App/Models/Presence'
import CreatePresenceValidator from 'App/Validators/CreatePresenceValidator'
import UpdatePresenceValidator from 'App/Validators/UpdatePresenceValidator'
import { DateTime, Duration } from 'luxon'
import { validate as uuidValidation } from "uuid";
import { validator } from '@ioc:Adonis/Core/Validator'
import UpdateTimeOutPresenceValidator from 'App/Validators/UpdateTimeOutPresenceValidator'
export default class PresencesController {
  public async index({ request, response }: HttpContextContract) { // @ts-ignore
    const hariIni = DateTime.now().toSQLDate().toString() // @ts-ignore
    const { page = 1, limit = 10, keyword = "", activityId = "", orderBy = "time_in", orderDirection = 'ASC', fromDate = hariIni, toDate = hariIni } = request.qs()
    //TODO: bikin raw query & select secukupnya biar bisa order by join column

    const activity = await Activity.findOrFail(activityId)
    const presence = await Presence.query()
      .select("*")
      .preload('employee', query => {
        query.select('name', 'id', 'nip')
        query.orderBy('name')
      })
      .where('activity_id', activityId)
      .andWhere(query => {
        query.orWhereHas('employee', query => {
          query.whereILike('name', `%${keyword}%`)
        })
      })
      // .whereBetween('time_in', [fromDate, toDate])
      .andWhereRaw(`time_in::date between '${fromDate}' and '${toDate}'`)
      // .andWhereRaw(`time_in::date - '${toDate}'::date<=0`)
      // .andWhereRaw(`time_in::date - '${fromDate}'::date>=0`)
      .orderBy(orderBy)
      .paginate(page, limit)

    // console.log(presence);


    response.ok({
      message: "Data Berhasil Didapatkan", data: {
        activity, presence
        // , recap: {
        //   overview: {
        //     totalLate: '00:17:52',
        //     averagePresentPerDay: '90%',
        //     mostPresentEmployee: {
        //       totalPresent: 22,
        //       fastestPresent: '06:00:01',
        //       empmloyee: {
        //         id: '1239081723987123',
        //         name: 'Fulan bin Fulan'
        //       }
        //     }
        //   },
        //   detail: [
        //     { id: '2312939301', name: 'Fulan bin Fulan', totalPresent: 22, fastestPresent: '06:00:01', totalLate: '00:00:00' },
        //     { id: '2312939301', name: 'Fulan bin Fulan', totalPresent: 22, fastestPresent: '06:00:01', totalLate: '00:00:00' },
        //     { id: '2312939301', name: 'Fulan bin Fulan', totalPresent: 22, fastestPresent: '06:00:01', totalLate: '00:00:00' },
        //     { id: '2312939301', name: 'Fulan bin Fulan', totalPresent: 22, fastestPresent: '06:00:01', totalLate: '00:00:00' },
        //     { id: '2312939301', name: 'Fulan bin Fulan', totalPresent: 22, fastestPresent: '06:00:01', totalLate: '00:00:00' },
        //     { id: '2312939301', name: 'Fulan bin Fulan', totalPresent: 22, fastestPresent: '06:00:01', totalLate: '00:00:00' },
        //     { id: '2312939301', name: 'Fulan bin Fulan', totalPresent: 22, fastestPresent: '06:00:01', totalLate: '00:00:00' },
        //   ]
        // }
      }
    })
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreatePresenceValidator)

    try {
      const data = await Presence.create(payload)
      response.created({ message: "Create data success", data })
    } catch (error) {
      console.log(error);
      response.badRequest({ ...error })
    }
  }

  public async scanRFID({ request, response }: HttpContextContract) {
    const { activityId, rfid } = request.body()
    const employeeId = (await Employee.findByOrFail('rfid', rfid)).id
    const activity = await Activity.findOrFail(activityId)
    const prezence = await Presence
      .query()
      .select()
      .preload('employee')
      .whereRaw(`timezone('Asia/Jakarta', now())::date - time_in::date =0`)
      .andWhereHas('employee', query => {
        query.where('rfid', rfid)
      })
      .andWhere('activityId', activityId)
      .first()

    // return response.ok({date :  DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss').toString()})
    if (prezence === null) { //belum ada data = belum pernah masuk
      // @ts-ignore
      const scanIn = await Presence.create({ activityId, employeeId, timeIn: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss').toString() })
      response.ok({ message: "Scan In Success", activity, scanIn })
    } else if (prezence!.timeOut === null) { //sudah ada data & belum keluar
      const scanOut = await prezence! // @ts-ignore
        .merge({ timeOut: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss').toString() })
        .save()
      response.ok({ message: "Scan Out Success", data: scanOut })
    } else {
      response.badRequest({ message: "Anda sudah melakukan scan in & scan out!" })
    }


    // TODO: check apakah dia sudah scan_in atau belum
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params
    const activity = await Activity.findOrFail(id)

    const presence = await Presence.query()
      .preload('employee', query => {
        query.select('name', 'id', 'nip')
      })
      .whereRaw(`timezone('Asia/Jakarta', now())::date - time_in::date=0`)
      .andWhere('activity_id', id)
      .andWhereNot('employee_id', '12e6c4b9-2942-4870-b48c-4b4a93eee52b')
      .orderBy('updated_at', 'desc')
    response.ok({ message: "Get data success", data: { activity, presence } })
  }

  public async edit({ params, response }: HttpContextContract) {
    const { id } = params
    try {
      const data = await Presence.query().preload('employee', query => query.select('name')).where('id', id).firstOrFail()
      response.ok({ message: "Get data success", data })
    } catch (error) {
      response.badRequest(error)
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params
    if (id == 'timeout') {
      // @ts-ignore
      const hariIni = DateTime.now().toSQLDate().toString()
      const { fromDate = hariIni, toDate = hariIni, timeOut = null, activity_id } = request.qs()
      if (activity_id) {
        const activity = await Activity.findOrFail(activity_id)
        const timeOutDefault = activity.$attributes.timeOutDefault

        const presence = await Presence.query()
          .select("id", "time_in", "time_out")
          .whereNull('time_out')
          .andWhereRaw(`time_in::date between '${fromDate}' and '${toDate}'`)

        if (presence.length == 0) {
          return response.badRequest({ message: "Data sudah lengkap" })
        }

        if (timeOutDefault == null && timeOut == null) {
          return response.badRequest({ message: "Data timeout harus diisi" })
        }

        presence.map(async value => {
          const id = value.$attributes.id
          const time_in = new Date(value.$attributes.timeIn).toISOString()
          const extractedDate = time_in.split("T")[0];
          let time_out = timeOutDefault ? extractedDate + " " + timeOutDefault : extractedDate + " " + timeOut;
          //@ts-ignore
          const presenceTimeOutValidator = new UpdateTimeOutPresenceValidator(null, { timeOut: time_out })
          const payload = await validator.validate(presenceTimeOutValidator)

          const findData = await Presence.findOrFail(id) // @ts-ignore
          await findData.merge(payload).save()
        })
        response.ok({ message: "Update data success" })
      }
    } else {
      if (!uuidValidation(id)) { return response.badRequest({ message: "Presence ID tidak valid" }) }
      const payload = await request.validate(UpdatePresenceValidator)
      try {
        const findData = await Presence.findOrFail(id) // @ts-ignore
        const data = await findData.merge(payload).save()
        response.ok({ message: "Update data success", data })
      } catch (error) {
        console.log(error);
        response.badGateway({ ...error })
      }
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params
    try {
      const data = await Presence.findOrFail(id)
      await data.delete()

      response.ok({ message: "Delete data success" })
    } catch (error) {
      console.log(error);
      response.internalServerError(error)
    }
  }


  public async recap({ params, response, request }: HttpContextContract) {// @ts-ignore
    const hariIni = DateTime.now().toSQLDate().toString()
    const { id } = params
    const { from = hariIni, to = hariIni } = request.qs()

    const { rows: detail } = await Database.rawQuery(`
      select name, time_in, time_out, case when (keterlambatan > interval '1 second') then cast(keterlambatan as varchar) else '0' end late
      from (
        select e.name, p.time_in, p.time_out, time_in ::time - '07:30:00'::time keterlambatan
        from presences p
        left join employees e
          on e.id = p.employee_id
        where activity_id  = '${id}'
        and time_in::date between '${from}' and '${to}'
        order by e.name , time_in
      ) data
      order by name, time_in
    `)

    const recapHourlyQuery = `
      select id, name
        ,count(name) total
        ,cast(sum(time_out :: time - time_in::time) as varchar) total_hours
        ,case when sum(time_in ::time - '07:30:00'::time) > interval '0 second' then cast(sum(time_in ::time - '07:30:00'::time) as varchar)  else '0' end late
      from (
        select e.id, e.name
        ,time_in
        ,case when time_out is not null then time_out else time_in :: date + '12:30:00':: time end time_out
        from presences p
        left join employees e
          on e.id = p.employee_id
        where activity_id  = '${id}'
        and time_in::date between '${from}' and '${to}'
        order by e.name
      )a
      group by name, id
      order by name
    `


    const { rows: recap } = await Database.rawQuery(recapHourlyQuery)

    const { rows: [overview] } = await Database.rawQuery(`
      select data.*, (presence_total/presence_expected)*100  presence_precentage, mostPresent.*
      from
      (
        select cast(sum(time_in ::time - '07:30:00'::time) as varchar)  late_total, employee_total, ('${to}'::date - '${from}'::date + 1) day_total
        ,  ('${to}'::date - '${from}'::date + 1) * employee_total presence_expected
        , count(*) presence_total
        from presences p
          ,(select count(id) employee_total from employees) e
        where activity_id  = '${id}'
        and time_in::date between '${from}' and '${to}'
        group by employee_total
      ) data
      ,
      (
        select e.name employee_most_present, count(e.name) employee_presence_total
        from presences p
        left join employees e
          on e.id = p.employee_id
        where activity_id  = '${id}'
        and time_in::date between '${from}' and '${to}'
        group by e.name
        order by count(e.name) desc, sum(time_in ::time - '07:30:00'::time)
        limit 1
      ) mostPresent
    `)

    response.ok({ message: "Get data success", overview, recap, detail })
  }

  public async hours({ params, response, request }: HttpContextContract) { // @ts-ignore
    const hariIni = DateTime.now().toSQLDate().toString()
    const { id } = params
    let { from = hariIni, to = hariIni, employeeId } = request.qs()

    const recapHourlyEmployeeQuery = `
      select *
      from (
        select employee_id, name, time_in, time_out, max_working_duration ,total_hours as original_total_hours
        ,case when EXTRACT(epoch FROM (total_hours::time - max_working_duration::time)) /60  <=0 then total_hours else cast(max_working_duration as varchar) end total_hours
        ,cast((total_hours::time - max_working_duration::time) as varchar) working_time_diff
        from (
          select *
            -- ini untuk cek apakah dia tap in setelah jam 12:30 siang
            ,case when left(total_hours_check, 1) <> '-' then total_hours_check else '00:00:00' end total_hours
          from (
            select *
                ,cast((sum(time_out :: time - time_in::time)) as varchar) total_hours_check
              from (
                  select e.id employee_id
                    ,e.name
                    ,time_in
                    ,case when time_out is not null then time_out else time_in :: date + '12:30:00':: time end time_out
                    ,a.max_working_duration
                    from presences p
                  left join employees e
                    on e.id = p.employee_id
                  left join activities a
                    on a.id = activity_id
                    where activity_id  = '${id}'
                    and time_in::date between '${from}' and '${to}'
                    and e.id = '${employeeId}'
                    order by e.name
              ) x
              group by employee_id, name, time_in, time_out, max_working_duration
            ) m
        ) y
      )z
      `


    const { rows: recapHourlyEmployee } = await Database.rawQuery(recapHourlyEmployeeQuery)
    // return recapHourlyEmployee
    const recapDate = {}
    // let grandTotalHours = "00:00:00.000"

    recapHourlyEmployee?.forEach(data => {
      const timeIn = DateTime.fromISO(data.time_in.toISOString())
      const timeOut = DateTime.fromISO(data.time_out.toISOString())
      const workingTimeDiff = data.working_time_diff
      const originalTotalHours = data.original_total_hours
      const weekNumber = timeIn.weekNumber
      const year = timeIn.year
      const name = year + "-" + weekNumber
      const totalHours = Duration.fromISOTime(data.total_hours)
      const dates = { timeIn, timeOut, totalHours: totalHours.toFormat("hh:mm:ss"), workingTimeDiff, originalTotalHours }
      const isi = { weekNumber, totalHoursInWeek: totalHours.toFormat("hh:mm:ss"), dates: [dates] }

      // BUG: grandTotalHours bug if more than 100 hours, alternative : use total_hours from /recap
      // console.log(grandTotalHours, totalHours.toISOTime());
      // grandTotalHours = Duration.fromISOTime(grandTotalHours).plus(totalHours).toFormat("hh:mm:ss")
      // console.log(grandTotalHours);

      if (name in recapDate) {
        const newTotalHoursInWeek = Duration.fromISOTime(recapDate[name].totalHoursInWeek).plus(totalHours).toFormat("hh:mm:ss")
        recapDate[name].totalHoursInWeek = newTotalHoursInWeek
        recapDate[name].dates.push(dates)
      } else {
        recapDate[name] = isi
      }
    })

    const sortedRecaps = Object.entries(recapDate).sort().reduce((o, [k, v]) => (o[k] = v, o), {})

    // remarked due to BUG
    // return response.ok({ message: "Berhasil mengambil data", grandTotalHours, data: sortedRecaps })
    return response.ok({ message: "Berhasil mengambil data", data: sortedRecaps })
  }
}
