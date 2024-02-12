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
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'

function calculateWorkingTimeDiff(times) {
  let positiveSum = 0;
  let negativeSum = 0;

  // Mengelompokkan antara negatif dan positif dan menjumlahkannya
  times.forEach(date => {
    const [hours, minutes, seconds] = date.split(':').map(Number);

    if (hours < 0 || minutes < 0 || seconds < 0 || Object.is(hours, -0) || Object.is(minutes, -0) || Object.is(seconds, -0)) {
      const absoluteHours = Math.abs(hours);
      const absoluteMinutes = Math.abs(minutes);
      const absoluteSeconds = Math.abs(seconds);
      negativeSum += (absoluteHours * 3600 + absoluteMinutes * 60 + absoluteSeconds);
    } else {
      positiveSum += (hours * 3600 + minutes * 60 + seconds);
    }
  });

  if (negativeSum != 0) {
    negativeSum = -negativeSum
  }

  // Jika semua nilai positif
  if (positiveSum > 0 && negativeSum === 0) {
    const totalSeconds = positiveSum;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}:${minutes}:${seconds}`;
  }
  // Jika semua nilai negatif
  else if (negativeSum < 0 && positiveSum === 0) {
    const totalSeconds = Math.abs(negativeSum);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `-${Math.abs(hours)}:${Math.abs(minutes).toString().padStart(2, '0')}:${Math.abs(seconds).toString().padStart(2, '0')}`;
  }
  // Jika tidak, maka menjumlahkan antara kelompok positif dan negatif
  else {
    negativeSum = -negativeSum
    let totalSeconds
    if (positiveSum > negativeSum) {
      totalSeconds = positiveSum - negativeSum
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${hours}:${minutes}:${seconds}`;
    } else {
      totalSeconds = negativeSum - positiveSum
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `-${hours}:${minutes}:${seconds}`;
    }
  }
}

function padZero(num) {
  return num < 10 ? '0' + num : num;
}

function formatTime(time) {
  const [hours, minutes, seconds] = time.split(':').map(Number);

  if (hours < 0 || minutes < 0 || seconds < 0 || Object.is(hours, -0) || Object.is(minutes, -0) || Object.is(seconds, -0)) {
    const absoluteHours = padZero(Math.abs(hours));
    const absoluteMinutes = padZero(Math.abs(minutes));
    const absoluteSeconds = padZero(Math.abs(seconds));
    return `-${absoluteHours}:${absoluteMinutes}:${absoluteSeconds}`;
  } else {
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
  }
}

export default class PresencesController {
  public async index({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    // @ts-ignore
    const hariIni = DateTime.now().toSQLDate().toString()
    // @ts-ignore
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

    presence.forEach(value => {
      value.$extras.timeDiff = formatTime(value.$extras.timeDiff)
    })

    CreateRouteHist(statusRoutes.FINISH, dateStart)
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
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const payload = await request.validate(CreatePresenceValidator)

    try {
      const data = await Presence.create(payload)
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.created({ message: "Create data success", data })
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      console.log(error);
      response.badRequest({ ...error })
    }
  }

  public async scanRFID({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
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
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Scan In Success", activity, scanIn })
    } else if (prezence!.timeOut === null) { //sudah ada data & belum keluar
      const scanOut = await prezence! // @ts-ignore
        .merge({ timeOut: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss').toString() })
        .save()
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Scan Out Success", data: scanOut })
    } else {
      response.badRequest({ message: "Anda sudah melakukan scan in & scan out!" })
    }


    // TODO: check apakah dia sudah scan_in atau belum
  }

  public async show({ params, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
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
    CreateRouteHist(statusRoutes.FINISH, dateStart)
    response.ok({ message: "Get data success", data: { activity, presence } })
  }

  public async edit({ params, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { id } = params
    try {
      const data = await Presence.query().preload('employee', query => query.select('name')).where('id', id).firstOrFail()
      CreateRouteHist(statusRoutes.FINISH, dateStart)
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
          .select("id", "time_in", "time_out", "activity_id")
          .whereNull('time_out')
          .andWhere('activity_id', '=', activity_id)
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
          let time_out = timeOut ? extractedDate + " " + timeOut : extractedDate + " " + timeOutDefault;
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


  public async recap({ params, response, request }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    // @ts-ignore
    const hariIni = DateTime.now().toSQLDate().toString()
    const { id } = params
    const { from = hariIni, to = hariIni } = request.qs()

    try {
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

      const selisihWaktu = await Presence.query()
        .select('*') // Select only the employee_id
        .preload('employee', query => {
          query.select('name', 'id', 'nip')
            .orderBy('name');
        })
        .where('activity_id', id)
        .andWhereRaw(`time_in::date BETWEEN '${from}' AND '${to}'`)

      const selisihWaktuObject = JSON.parse(JSON.stringify(selisihWaktu))
      const recapObject = JSON.parse(JSON.stringify(recap))

      let resultRecap: any[] = [];

      for (let i = 0; i < recapObject.length; i++) {
        let recapItem = recapObject[i];
        let workingTimeDiffArray: string[] = [];

        for (let j = 0; j < selisihWaktuObject.length; j++) {
          if (recapItem.id === selisihWaktuObject[j].employee_id) {
            workingTimeDiffArray.push(selisihWaktuObject[j].workingTimeDiff);
          }
        }

        recapItem.workingTimeDiffArray = workingTimeDiffArray;

        resultRecap.push(recapItem);
      }

      for (let i = 0; i < resultRecap.length; i++) {
        resultRecap[i].workingTimeDiff = calculateWorkingTimeDiff(resultRecap[i].workingTimeDiffArray)
        resultRecap[i].workingTimeDiff = formatTime(resultRecap[i].workingTimeDiff)
      }

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Get data success", overview, recap: resultRecap, detail })
    } catch (error) {
      const message = "RecapPresence: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async hours({ params, response, request }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    // @ts-ignore
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
    CreateRouteHist(statusRoutes.FINISH, dateStart)
    return response.ok({ message: "Berhasil mengambil data", data: sortedRecaps })
  }
}
