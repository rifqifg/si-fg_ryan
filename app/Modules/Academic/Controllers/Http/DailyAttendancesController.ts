import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateDailyAttendanceValidator from '../../Validators/CreateDailyAttendanceValidator'
import DailyAttendance from '../../Models/DailyAttendance'
import { DateTime } from 'luxon'
import { validate as uuidValidation } from "uuid";
import UpdateDailyAttendanceValidator from '../../Validators/UpdateDailyAttendanceValidator';
import Database from '@ioc:Adonis/Lucid/Database';

export default class DailyAttendancesController {
  public async index({ request, response }: HttpContextContract) {
    const hariIni = DateTime.now().toSQLDate()!.toString();
    const { page = 1, limit = 10, keyword = "", mode = "page", classId = "", fromDate = hariIni, toDate = hariIni, recap = false } = request.qs()

    // karena ada kemungkinan input fromDate & toDate formatnya 'yyyy-MM-dd 00:00:00', maka diambil value yg sebelum whitespace
    const splittedFromDate = fromDate.split(' ')[0]
    const splittedToDate = toDate.split(' ')[0]

    const formattedStartDate = `${splittedFromDate ? splittedFromDate : hariIni} 00:00:00.000 +0700`;
    const formattedEndDate = `${splittedToDate ? splittedToDate : hariIni} 23:59:59.000 +0700`;
    try {
      let data = {}
      if (recap) {
        //TODO: buat rekap data absen harian
        let totalDays = 0
        let start = new Date(fromDate)
        let end = new Date(toDate)

        while (start <= end) {
          if (start.getDay() !== 0 && start.getDay() !== 6) {
            totalDays++;
          }
          start.setDate(start.getDate() + 1);
        }

        if (recap === 'kelas') {
          data = await DailyAttendance
            .query()
            .select('class_id')
            .select(
              Database.raw(`sum(case when status = 'present' then 1 else 0 end) as present`),
              Database.raw(`sum(case when status = 'permission' then 1 else 0 end) as permission`),
              Database.raw(`sum(case when status = 'sick' then 1 else 0 end) as sick`),
              Database.raw(`sum(case when status = 'absent' then 1 else 0 end) as absent`),
              //TODO: menghitung persen status
              Database.raw(`round(cast(sum(case when status = 'present' then 1 else 0 end) * 100.0 / (count(distinct student_id) * ${totalDays})as decimal(10,2)),0) as present_precentage`),
              Database.raw(`round(cast(sum(case when status = 'permission' then 1 else 0 end) * 100.0 / (count(distinct student_id) * ${totalDays})as decimal(10,2)),0) as permission_precentage`),
              Database.raw(`round(cast(sum(case when status = 'sick' then 1 else 0 end) * 100.0 / (count(distinct student_id) * ${totalDays})as decimal(10,2)),0) as sick_precentage`),
              Database.raw(`round(cast(sum(case when status = 'absent' then 1 else 0 end) * 100.0 / (count(distinct student_id) * ${totalDays})as decimal(10,2)),0) as absent_precentage`),
            )
            .whereBetween('date_in', [formattedStartDate, formattedEndDate])
            .preload('class', c => c.select('name', 'nis').withCount('students'))
            .groupBy('class_id')
            .paginate(page, limit)
        } else if (recap === 'siswa') {
          data = await DailyAttendance
            .query()
            .select('student_id', 'class_id')
            .select(
              Database.raw(`sum(case when status = 'present' then 1 else 0 end) as present`),
              Database.raw(`sum(case when status = 'permission' then 1 else 0 end) as permission`),
              Database.raw(`sum(case when status = 'sick' then 1 else 0 end) as sick`),
              Database.raw(`sum(case when status = 'absent' then 1 else 0 end) as absent`),
              //TODO: menghitung persen status
              Database.raw(`round(cast(sum(case when status = 'present' then 1 else 0 end) * 100.0 / ${totalDays} as decimal(10,2)),0) as present_precentage`),
              Database.raw(`round(cast(sum(case when status = 'permission' then 1 else 0 end) * 100.0 / ${totalDays} as decimal(10,2)),0) as permission_precentage`),
              Database.raw(`round(cast(sum(case when status = 'sick' then 1 else 0 end) * 100.0 / ${totalDays} as decimal(10,2)),0) as sick_precentage`),
              Database.raw(`round(cast(sum(case when status = 'absent' then 1 else 0 end) * 100.0 / ${totalDays} as decimal(10,2)),0) as absent_precentage`),
            )
            .whereBetween('date_in', [formattedStartDate, formattedEndDate])
            .preload('student', student => student.select('name', 'classId', 'nis').preload('class', kelas => kelas.select('name')))
            .groupBy('student_id', 'class_id')
            .paginate(page, limit)
        } else {
          return response.badRequest({ message: "Value parameter recap tidak dikenali, (pilih: kelas / siswa)" })
        }

        return response.ok({ message: "Berhasil mengambil data", data })
      }
      if (mode === "page") {
        if (classId == "") {
          data = await DailyAttendance
            .query()
            .select('*')
            .whereBetween('date_in', [formattedStartDate, formattedEndDate])
            .whereHas('student', s => s.whereILike('name', `%${keyword}%`))
            .preload('student', s => s.select('name', 'nis'))
            .preload('class', s => s.select('name'))
            .orderBy('class_id')
            .orderBy('created_at')
            .paginate(page, limit)
        } else {
          data = await DailyAttendance
            .query()
            .select('*')
            .where('class_id', `${classId}`)
            .whereBetween('date_in', [formattedStartDate, formattedEndDate])
            .whereHas('student', s => s.whereILike('name', `%${keyword}%`))
            .preload('student', s => s.select('name', 'nis'))
            .preload('class', s => s.select('name'))
            .paginate(page, limit)
        }
      } else if (mode === "list") {
        if (classId == "") {
          data = await DailyAttendance
            .query()
            .select('*')
            .whereBetween('date_in', [formattedStartDate, formattedEndDate])
            .whereHas('student', s => s.whereILike('name', `%${keyword}%`))
            .preload('student', s => s.select('name', 'nis'))
            .preload('class', s => s.select('name'))
            .orderBy('class_id')
            .orderBy('created_at')
        } else {
          data = await DailyAttendance
            .query()
            .select('*')
            .where('class_id', `${classId}`)
            .whereBetween('date_in', [formattedStartDate, formattedEndDate])
            .whereHas('student', s => s.whereILike('name', `%${keyword}%`))
            .preload('student', s => s.select('name', 'nis'))
            .preload('class', s => s.select('name'))
        }
      } else {
        return response.badRequest({ message: "Mode tidak dikenali, (pilih: page / list)" })
      }

      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      const message = "ACDA-index: " + error.message || error
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error
      })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateDailyAttendanceValidator)

    try {
      const weekdayNumber = payload.dailyAttendance[0].date_in.weekday
      if (weekdayNumber === 6 || weekdayNumber === 7) {
        throw new Error("Tidak dapat melakukan absen di hari sabtu / minggu")
      }

      const dateInDateOnly = payload.dailyAttendance[0].date_in.toSQLDate()!
      const existingAttendance = await DailyAttendance.query()
        .whereRaw('date_in::timestamp::date = ?', [dateInDateOnly])
        .andWhere('class_id', payload.dailyAttendance[0].classId)

      if (existingAttendance.length > 0) {
        throw new Error("Abensi kelas ini untuk tanggal yang dipilih sudah ada")
      }

      if (payload.dailyAttendance[0].date_out) {
        const dateIn = payload.dailyAttendance[0].date_in
        const dateOut = payload.dailyAttendance[0].date_out

        const selisihDetik = dateOut.diff(dateIn, 'seconds').toObject().seconds!

        if (selisihDetik < 1) {
          throw new Error("Waktu mulai tidak boleh dibelakang waktu berakhir")
        }
      }

      const data = await DailyAttendance.createMany(payload.dailyAttendance)
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      const message = "ACDA-store: " + error.message || error
      console.log(error);
      response.badRequest({
        message: "Gagal menyimpan data",
        error: message,
        error_data: error
      })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "DailyAttendance ID tidak valid" }) }

    try {
      const data = await DailyAttendance
        .query()
        .preload('student', s => s.select('name'))
        .preload('class', s => s.select('name'))
        .where('id', id).firstOrFail()
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      const message = "ACSU77: " + error.message || error
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error
      })
    }
  }

  public async update({ request, response }: HttpContextContract) {

    const payload = await request.validate(UpdateDailyAttendanceValidator)
    if (JSON.stringify(payload) === '{}' || payload.daily_attendance.length < 1) {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" })
    }

    // karena isi array sama (kecuali attendance_id),
    // maka utk pengecekan cukup ambil index ke-0
    const payloadZero = payload.daily_attendance[0]

    // validasi input weekend
    if (payloadZero.date_in) {
      if (payloadZero.date_in.weekday === 6 || payloadZero.date_in.weekday === 7) {
        return response.badRequest({ message: "ACSU101: Tidak dapat mengubah absen ke hari sabtu / minggu" })
      }
    }
    if (payloadZero.date_out) {
      if (payloadZero.date_out.weekday === 6 || payloadZero.date_out.weekday === 7) {
        return response.badRequest({ message: "ACSU101: Tidak dapat mengubah absen ke hari sabtu / minggu" })
      }
    }

    try {
      const attendanceIds = payload.daily_attendance.map(el => el.id)
      const attendances = await DailyAttendance.findMany(attendanceIds)

      for (const attendance of attendances) {
        const waktuAwal: DateTime = (payloadZero.date_in) ? payloadZero.date_in : attendance.date_in
        const waktuAkhir: DateTime = (payloadZero.date_out) ? payloadZero.date_out : attendance.date_out // <-- hati2 ini bisa null

        // validasi tanggal overlap
        if (waktuAkhir !== null) {
          const selisihDetik = waktuAkhir.diff(waktuAwal, 'seconds').toObject().seconds!

          if (selisihDetik < 1) {
            throw new Error("Waktu mulai harus lebih dahulu dari waktu berakhir")
          }
        }

        // validasi data duplikat
        if (payloadZero.date_in || payloadZero.class_id || payloadZero.student_id) {
          const existingRecord = await DailyAttendance.query()
            .whereNot('id', attendance.id)
            .where('class_id', attendance.classId)
            .where('student_id', attendance.studentId)
            .whereRaw('date_in::timestamp::date = ?', [waktuAwal.toSQLDate()!])
            .preload('class')
            .preload('student')
            .first()

          if (existingRecord) {
            throw new Error(`Abensi siswa dengan nama ${existingRecord.student.name}, kelas ${existingRecord.class.name}, untuk tanggal ${waktuAwal.toSQLDate()} sudah ada`)
          }
        }
      }

      const data = await DailyAttendance.updateOrCreateMany('id', payload.daily_attendance)
      response.ok({ message: "Berhasil mengubah data", data })
    } catch (error) {
      const message = "ACSU101: " + error.message || error
      console.log(error);
      response.badRequest({
        message: "Gagal mengubah data",
        error: message,
        error_data: error
      })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "DailyAttendance ID tidak valid" }) }

    try {
      const data = await DailyAttendance.findOrFail(id)
      await data.delete()
      response.ok({ message: "Berhasil menghapus data" })
    } catch (error) {
      const message = "ACSU120: " + error.message || error
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error
      })
    }
  }
}
