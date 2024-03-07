import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import CreateDailyAttendanceValidator from "../../Validators/CreateDailyAttendanceValidator";
import DailyAttendance from "../../Models/DailyAttendance";
import { DateTime } from "luxon";
import { validate as uuidValidation } from "uuid";
import UpdateDailyAttendanceValidator from "../../Validators/UpdateDailyAttendanceValidator";
import Database from "@ioc:Adonis/Lucid/Database";
import { statusRoutes } from "App/Modules/Log/lib/enum";
import { CreateRouteHist } from "App/Modules/Log/Helpers/createRouteHist";
import User from "App/Models/User";
import { RolesHelper } from "App/Helpers/rolesHelper";

export default class DailyAttendancesController {
  public async index({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis();
    CreateRouteHist(statusRoutes.START, dateStart);
    const hariIni = DateTime.now().toSQLDate()!.toString();
    const {
      page = 1,
      limit = 10,
      keyword = "",
      mode = "page",
      classId = "",
      fromDate = hariIni,
      toDate = hariIni,
      recap = false,
      sortingByAbsent = false,
      lastDays = 7,
      lastMonths = 3,
      foundationId
    } = request.qs();

    if (classId && !uuidValidation(classId)) {
      return response.badRequest({ message: "class ID tidak valid" });
    }

    // karena ada kemungkinan input fromDate & toDate formatnya 'yyyy-MM-dd 00:00:00', maka diambil value yg sebelum whitespace
    const splittedFromDate = fromDate.split(" ")[0];
    const splittedToDate = toDate.split(" ")[0];

    const formattedStartDate = `${splittedFromDate ? splittedFromDate : hariIni
      } 00:00:00.000 +0700`;
    const formattedEndDate = `${splittedToDate ? splittedToDate : hariIni
      } 23:59:59.000 +0700`;
    try {
      const user = await User.query()
        .preload('employee', e => e
          .select('id', 'name', 'foundation_id'))
        .preload('roles', r => r
          .preload('role'))
        .where('employee_id', auth.user!.$attributes.employeeId)
        .first()

      const userObject = JSON.parse(JSON.stringify(user))
      const roles = await RolesHelper(userObject)

      let data = {};
      if (recap) {
        //TODO: buat rekap data absen harian
        let totalDays = 0;
        let start = new Date(fromDate);
        let end = new Date(toDate);

        while (start <= end) {
          if (start.getDay() !== 0 && start.getDay() !== 6) {
            totalDays++;
          }
          start.setDate(start.getDate() + 1);
        }

        const whereClassId = classId ? `and c.id = '${classId}'` : "";
        //buat filter by foundationId
        let whereFoundationId = ""
        if (!roles.includes('super_admin')) {
          whereFoundationId = `and c.foundation_id = '${user!.employee.foundationId}'`
        } else if (roles.includes('super_admin') && foundationId) {
          whereFoundationId = `and c.foundation_id = '${foundationId}'`
        }

        const agenda = await Database.rawQuery(
          `(select count(*) from academic.agendas a where a.count_presence = false and date between '${formattedStartDate}'::date AND '${formattedEndDate}'::date)`
        );

        totalDays = totalDays - Number(agenda.rows[0].count);

        if (recap === "kelas") {
          // const rows  =  Database.rawQuery(`
          const { rows } = await Database.rawQuery(`
          select
	            c.name as class_name,
	            c.id as class_id,
	            count(distinct  da.student_id) as total_student,
	            sum(case when da.status = 'present' then 1 else 0 end) as present,
	            sum(case when da.status = 'permission' then 1 else 0 end) as permission,
	            sum(case when da.status = 'sick' then 1 else 0 end) as sick,
	            sum(case when da.status = 'absent' then 1 else 0 end) as absent,
	            round(cast(sum(case when da.status = 'present' then 1 else 0 end) * 100.0 / (count(distinct student_id) * ${totalDays})as decimal(10,
	            2)),
	            0) as present_precentage,
	            round(cast(sum(case when da.status = 'permission' then 1 else 0 end) * 100.0 / (count(distinct student_id) * ${totalDays})as decimal(10,
	            2)),
	            0) as permission_precentage,
	            round(cast(sum(case when da.status = 'sick' then 1 else 0 end) * 100.0 / (count(distinct student_id) * ${totalDays})as decimal(10,
	            2)),
	            0) as sick_precentage,
	            round(cast(sum(case when da.status = 'absent' then 1 else 0 end) * 100.0 / (count(distinct student_id) * ${totalDays})as decimal(10,
	            2)),
	            0) as absent_precentage,
	            round(cast(sum(case when da.status = 'present' then 1 else 0 end) * 100.0 / (count(distinct student_id) * ${totalDays})as decimal(10,
	            2)),
	            0) + round(cast(sum(case when status = 'sick' then 1 else 0 end) * 100.0 / (count(distinct student_id) * ${totalDays})as decimal(10,
	            2)),
	            0) as present_accumulation,
              (select count(distinct  c.id)
              from academic.daily_attendances da
              left join academic.students s
                  on s.id = da.student_id
              left join academic.classes c
                  on s.class_id = c.id
              where
                  date_in between '${formattedStartDate}' AND '${formattedEndDate}'
                  and c.is_graduated = false
                  ${whereClassId}
                  ${whereFoundationId}
                  and date_in not in  (select date from academic.agendas where count_presence = false)
              ) as total_data
              from
	              academic.daily_attendances da
              left join academic.students s
                      on
	                  da.student_id = s.id
              left join academic.classes c
                      on
	                  c.id = s.class_id
              where
	                  date_in between '${formattedStartDate}' AND '${formattedEndDate}'
	                  and c.is_graduated = false
                    ${whereClassId}
                    ${whereFoundationId}
                    and date_in::date not in  (select date from academic.agendas where count_presence = false)
              group by
              	c.name,
              	c.id
              order by c.name
              limit ${limit}
              offset ${(page - 1) * limit}

          `);
          // .toQuery()
          // return rows

          data = {
            meta: {
              total: +rows[0]?.total_data,
              per_page: +limit,
              current_page: +page,
            },
            data: rows,
          };
        } else if (recap === "siswa") {
          const { rows } = await Database.rawQuery(`
        select
          s."name" as student_name ,
          c.name as class_name,
          c.id as class_id,
          s.nis as nis,
          sum(case when da.status = 'present' then 1 else 0 end) as present,
          sum(case when da.status = 'permission' then 1 else 0 end) as permission,
          sum(case when da.status = 'sick' then 1 else 0 end) as sick,
          sum(case when da.status = 'absent' then 1 else 0 end) as absent,
          round(cast(sum(case when da.status = 'present' then 1 else 0 end) * 100.0 / (count(distinct student_id) * ${totalDays})as decimal(10,
          2)),
          0) as present_precentage,
          round(cast(sum(case when status = 'permission' then 1 else 0 end) * 100.0 / (count(distinct student_id) * ${totalDays})as decimal(10,2)),0) as permission_precentage,
          round(cast(sum(case when status = 'sick' then 1 else 0 end) * 100.0 / (count(distinct student_id) * ${totalDays})as decimal(10,2)),0) as sick_precentage,
          round(cast(sum(case when status = 'absent' then 1 else 0 end) * 100.0 / (count(distinct student_id) * ${totalDays})as decimal(10,2)),0) as absent_precentage,
          round(cast(sum(case when status = 'present' then 1 else 0 end) * 100.0 / (count(distinct student_id) * ${totalDays})as decimal(10,2)),0) + round(cast(sum(case when status = 'sick' then 1 else 0 end) * 100.0 / (count(distinct student_id) * ${totalDays})as decimal(10,2)),0) as present_accumulation,
          (select count(distinct da.student_id) from academic.daily_attendances da
          left join academic.students s
                  on s.id = da.student_id
          left join academic.classes c
                  on s.class_id = c.id
          where
                  date_in between '${formattedStartDate}' AND '${formattedEndDate}'
                  and c.is_graduated = false
                  ${whereClassId}
                  ${whereFoundationId}
                  and date_in not in  (select date from academic.agendas where count_presence = false)
          ) as total_data
       from
         academic.daily_attendances da
       left join academic.students s
                 on
         da.student_id = s.id
       left join academic.classes c
                 on
         c.id = s.class_id
       where
         date_in between '${formattedStartDate}' AND '${formattedEndDate}'
         and c.is_graduated = false
         and s.name ilike '%${keyword}%'
         ${whereClassId}
         ${whereFoundationId}
         and date_in::date not in  (select date from academic.agendas where count_presence = false)
       group by
         s.name,
         c.name,
         s.nis,
         c.id
        order by c.name
       limit ${limit}
                 offset ${limit * (page - 1)}

          `);

          data = {
            meta: {
              total: +rows[0]?.total_data,
              per_page: +limit,
              current_page: +page,
            },
            data: rows,
          };
        } else if (recap == "chart") {
          const { rows: getLastMonth } = await Database.rawQuery(`
          select distinct substring(cast(date_in::date as varchar), 0, 8) tanggal
          from academic.daily_attendances
          where date_in is not null
          order by substring(cast(date_in::date as varchar), 0, 8) desc
          limit ${lastMonths}`);

          const { rows: getLastDays } = await Database.rawQuery(`
          select distinct cast(date_in::date as varchar) tanggal
          from academic.daily_attendances
          where daily_attendances.date_in is not null
          and EXTRACT(ISODOW FROM date_in::date) < 6
          order by cast(date_in::date as varchar) desc
          limit ${lastDays}
          `);
          // return getLastDays[0].tanggal

          const { rows: date } = await Database.rawQuery(`
          select distinct cast(date_in::date as varchar) tanggal
          from academic.daily_attendances
          where daily_attendances.date_in is not null
          and EXTRACT(ISODOW FROM date_in::date) < 6
          order by cast(date_in::date as varchar) desc
          `);

          const startDate = getLastDays[getLastDays.length - 1].tanggal;
          const endDate = getLastDays[0].tanggal;

          const startMonth = getLastMonth[getLastMonth.length - 1].tanggal;
          const endMonth = getLastMonth[0].tanggal;

          const { rows: dataHarian } = await Database.rawQuery(`
          select
          	distinct cast(date_in::date as varchar) tanggal,
          	(c.name) as class_name,
          	(c.id) as class_id,
          	count(distinct da.student_id) as total_student,
          	(sum(case when da.status = 'present' then 1 else 0 end) + sum(case when da.status = 'sick' then 1 else 0 end)) as total_presence,
          	round(cast(sum(case when da.status = 'present' then 1 else 0 end) * 100.0 / (count(distinct student_id) )as decimal(10,
          	2)),
          	0) + round(cast(sum(case when status = 'sick' then 1 else 0 end) * 100.0 / (count(distinct student_id))as decimal(10,
          	2)),
          	0) as present_accumulation
          from
          	academic.daily_attendances da
          left join academic.students s
                             on
          	da.student_id = s.id
          left join academic.classes c
                             on
          	c.id = s.class_id
          where
            da.date_in::date between '${startDate}' and '${endDate}'
            ${whereFoundationId}
          	and da.date_in::date not in (
          	select
          		date
          	from
          		academic.agendas a
          	where
          		a.count_presence = false)
          group by
          	da.date_in,
          	c.name,
          	c.id
          order by
          	cast(date_in::date as varchar) desc

          `);
          const { rows: akumulasiBulanan } = await Database.rawQuery(`
            with presence_calc as (
              select * from
              (select c.id, c.name, count(s.id) total
              from academic.students s
              left join academic.classes c
              on c.id = s.class_id
              where c.is_graduated = false
              ${whereFoundationId}
              group by c.name, c.id
              order by c.name) ts,
              (
                  WITH date_range AS (
                      SELECT generate_series('${date[date.length - 1].tanggal
            }'::date, '${date[0].tanggal
            }'::date, '1 day'::interval) AS date
                  )
                  SELECT COUNT(*) AS days_count
                  FROM date_range
                  WHERE EXTRACT(ISODOW FROM date) < 6
                      AND date not in (select date from academic.agendas where count_presence <> true)
              ) dc
          )
          select pc.days_count, c.id as class_id, c."name" as class_name , count(da.status) as total_presence,  count(distinct s.id) as total_student,
                round(cast(sum(case when da.status = 'present' then 1 else 0 end) * 100.0 / (count(distinct student_id) * pc.days_count)as decimal(10,
              2)),
              0) + round(cast(sum(case when status = 'sick' then 1 else 0 end) * 100.0 / (count(distinct student_id) * pc.days_count )as decimal(10,
              2)),
              0) as present_accumulation

          from academic.daily_attendances da
          left join academic.students s
              on s.id = da.student_id
          left join academic.classes c
              on c.id = s.class_id
          left join presence_calc pc
              on pc.id = c.id
          where da.status in ('present','sick')
          ${whereFoundationId}
          and substring(cast(da.date_in::date as varchar),0,8) between '${startMonth}' and '${endMonth}'
          group by c.name, c.id , days_count
          order by c.name
         `);

          const { rows: dataBulanan } = await Database.rawQuery(`
          with presence_calc as (
            select *, (total * days_count) total_days from
            (select c.id, c.name, count(s.id) total
            from academic.students s
            left join academic.classes c
            on c.id = s.class_id
            where c.is_graduated = false
            ${whereFoundationId}
            group by c.name, c.id
            order by c.name) ts,
            (
                WITH date_range AS (
                -- tanggal dinamis dari input
                    SELECT generate_series('${date[date.length - 1].tanggal
            }'::date, '${date[0].tanggal
            }'::date, '1 day'::interval) AS date
                )
                SELECT extract(month from date) bulan ,COUNT(*) AS days_count
                FROM date_range
                WHERE EXTRACT(ISODOW FROM date) < 6
                    AND date not in (select date from academic.agendas where count_presence <> true)
                group by extract(month from date)
            ) dc
        )

        select c.id as class_id, c."name" as class_name , count(da.status) as total_presence, extract(month from date_in) bulan, count(distinct s.id) as total_student,
            round(cast(sum(case when da.status = 'present' then 1 else 0 end) * 100.0 / (count(distinct student_id) * pc.days_count)as decimal(10,
          2)),
          0) + round(cast(sum(case when status = 'sick' then 1 else 0 end) * 100.0 / (count(distinct student_id) * pc.days_count )as decimal(10,
          2)),
          0) as present_accumulation

        from academic.daily_attendances da
        left join academic.students s
            on s.id = da.student_id
        left join academic.classes c
            on c.id = s.class_id
        left join presence_calc pc
            on pc.id = c.id
            and pc.bulan = extract(month from date_in)
        where da.status in ('present','sick')
        ${whereFoundationId}
        and substring(cast(da.date_in::date as varchar),0,8) between '${startMonth}' and '${endMonth}'
        group by c.name, extract(month from date_in), pc.total_days, c.id , days_count
        order by extract(month from date_in) desc, c.name


          `);
          // .toQuery()

          // return rows
          data = {
            dataHarian,
            dataBulanan,
            akumulasiBulanan,
          };
        } else {
          return response.badRequest({
            message:
              "Value parameter recap tidak dikenali, (pilih: kelas / siswa)",
          });
        }
        CreateRouteHist(statusRoutes.FINISH, dateStart);
        return response.ok({ message: "Berhasil mengambil data", data });
      }
      if (mode === "page") {
        data = await DailyAttendance.query()
          .select("academic.daily_attendances.*")
          .leftJoin(
            "academic.students as s",
            "s.id",
            "academic.daily_attendances.student_id"
          )
          .joinRaw("left join academic.classes c on c.id = s.class_id")
          .preload(
            "student",
            (s) => (
              s.select("name", "nis", "class_id"),
              s.preload("class", (c) => c.select("name"))
            )
          )
          .whereBetween("date_in", [formattedStartDate, formattedEndDate])
          .whereHas("student", (s) => s.whereILike("name", `%${keyword}%`))
          .if(sortingByAbsent, (q) =>
            q.orderByRaw(`(case when academic.daily_attendances.status = 'sick' then concat('1-', academic.daily_attendances.status)
          when academic.daily_attendances.status = 'permission' then concat('2-', academic.daily_attendances.status)
          when academic.daily_attendances.status = 'absent' then concat('3-', academic.daily_attendances.status)
          when academic.daily_attendances.status = 'present' then concat('4-', academic.daily_attendances.status)
        end), c.name, academic.daily_attendances.description`)
          )
          .orderBy("c.name")
          .orderBy("academic.daily_attendances.created_at")
          .orderBy("s.name")
          .if(classId, (c) =>
            c.whereHas("student", (st) => st.where("class_id", classId))
          )
          .if(!roles.includes('super_admin'), query => query
            .whereHas('student', s => s.where('foundation_id', user!.employee.foundationId))
          )
          .if(roles.includes('super_admin') && foundationId, query => query
            .whereHas('student', s => s.where('foundation_id', foundationId))
          )
          .paginate(page, limit);
      } else if (mode === "list") {
        data = await DailyAttendance.query()
          .select("academic.daily_attendances.*")
          .leftJoin(
            "academic.students as s",
            "s.id",
            "academic.daily_attendances.student_id"
          )
          .preload(
            "student",
            (s) => (
              s.select("name", "nis", "class_id"),
              s.preload("class", (c) => c.select("name"))
            )
          )
          .joinRaw("left join academic.classes c on c.id = s.class_id")
          .whereBetween("date_in", [formattedStartDate, formattedEndDate])
          .if(sortingByAbsent, (q) =>
            q.orderByRaw(`(case when academic.daily_attendances.status = 'sick' then concat('1-', academic.daily_attendances.status)
          when academic.daily_attendances.status = 'permission' then concat('2-', academic.daily_attendances.status)
          when academic.daily_attendances.status = 'absent' then concat('3-', academic.daily_attendances.status)
          when academic.daily_attendances.status = 'present' then concat('4-', academic.daily_attendances.status)
        end),c.name, academic.daily_attendances.description `)
          )
          .whereHas("student", (s) => s.whereILike("name", `%${keyword}%`))
          .orderBy("c.name")
          .orderBy("academic.daily_attendances.created_at")
          .orderBy("s.name")
          .if(classId, (c) =>
            c.whereHas("student", (st) => st.where("class_id", classId))
          )
          .if(!roles.includes('super_admin'), query => query
            .whereHas('student', s => s.where('foundation_id', user!.employee.foundationId))
          )
          .if(roles.includes('super_admin') && foundationId, query => query
            .whereHas('student', s => s.where('foundation_id', foundationId))
          );
      } else {
        return response.badRequest({
          message: "Mode tidak dikenali, (pilih: page / list)",
        });
      }
      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "ACDA-index: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message);
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis();
    CreateRouteHist(statusRoutes.START, dateStart);
    const payload = await request.validate(CreateDailyAttendanceValidator);

    try {
      const weekdayNumber = payload.dailyAttendance[0].date_in.weekday;
      if (weekdayNumber === 6 || weekdayNumber === 7) {
        throw new Error("Tidak dapat melakukan absen di hari sabtu / minggu");
      }
      const stuedentIds = payload.dailyAttendance.map((st) => st.studentId);

      const dateInDateOnly = payload.dailyAttendance[0].date_in.toSQLDate()!;
      const existingAttendance = await DailyAttendance.query()
        .whereRaw("date_in::timestamp::date = ?", [dateInDateOnly])
        .andWhereIn("student_id", stuedentIds);

      if (existingAttendance.length > 0) {
        throw new Error(
          "Abensi kelas ini untuk tanggal yang dipilih sudah ada"
        );
      }

      if (payload.dailyAttendance[0].date_out) {
        const dateIn = payload.dailyAttendance[0].date_in;
        const dateOut = payload.dailyAttendance[0].date_out;

        const selisihDetik = dateOut.diff(dateIn, "seconds").toObject()
          .seconds!;

        if (selisihDetik < 1) {
          throw new Error("Waktu mulai tidak boleh dibelakang waktu berakhir");
        }
      }

      const data = await DailyAttendance.createMany(payload.dailyAttendance);
      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.created({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      const message = "ACDA-store: " + error.message || error;
      console.log(error);
      CreateRouteHist(statusRoutes.ERROR, dateStart, message);
      response.badRequest({
        message: "Gagal menyimpan data",
        error: message,
        error_data: error,
      });
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis();
    CreateRouteHist(statusRoutes.START, dateStart);
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "DailyAttendance ID tidak valid" });
    }

    try {
      const data = await DailyAttendance.query()
        .preload(
          "student",
          (s) => (
            s.select("name", "class_id"),
            s.preload("class", (c) => c.select("name"))
          )
        )
        .where("id", id)
        .firstOrFail();

      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "ACSU77: " + error.message || error;
      console.log(error);
      CreateRouteHist(statusRoutes.ERROR, dateStart, message);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async update({ request, response }: HttpContextContract) {
    const payload = await request.validate(UpdateDailyAttendanceValidator);
    if (
      JSON.stringify(payload) === "{}" ||
      payload.daily_attendance.length < 1
    ) {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }

    // karena isi array sama (kecuali attendance_id),
    // maka utk pengecekan cukup ambil index ke-0
    const payloadZero = payload.daily_attendance[0];

    // validasi input weekend
    if (payloadZero.date_in) {
      if (
        payloadZero.date_in.weekday === 6 ||
        payloadZero.date_in.weekday === 7
      ) {
        return response.badRequest({
          message: "ACSU101: Tidak dapat mengubah absen ke hari sabtu / minggu",
        });
      }
    }
    if (payloadZero.date_out) {
      if (
        payloadZero.date_out.weekday === 6 ||
        payloadZero.date_out.weekday === 7
      ) {
        return response.badRequest({
          message: "ACSU101: Tidak dapat mengubah absen ke hari sabtu / minggu",
        });
      }
    }

    try {
      const attendanceIds = payload.daily_attendance.map((el) => el.id);
      const attendances = await DailyAttendance.findMany(attendanceIds);

      for (const attendance of attendances) {
        const waktuAwal: DateTime = payloadZero.date_in
          ? payloadZero.date_in
          : attendance.date_in;
        const waktuAkhir: DateTime = payloadZero.date_out
          ? payloadZero.date_out
          : attendance.date_out; // <-- hati2 ini bisa null

        // validasi tanggal overlap
        if (waktuAkhir !== null) {
          const selisihDetik = waktuAkhir.diff(waktuAwal, "seconds").toObject()
            .seconds!;

          if (selisihDetik < 1) {
            throw new Error(
              "Waktu mulai harus lebih dahulu dari waktu berakhir"
            );
          }
        }

        // validasi data duplikat
        if (
          payloadZero.date_in ||
          payloadZero.class_id ||
          payloadZero.student_id
        ) {
          const existingRecord = await DailyAttendance.query()
            .whereNot("id", attendance.id)
            // .where("class_id", attendance.classId)
            .where("student_id", attendance.studentId)
            .whereRaw("date_in::timestamp::date = ?", [waktuAwal.toSQLDate()!])
            // .preload("class")
            .preload("student")
            .first();

          if (existingRecord) {
            throw new Error(
              `Abensi siswa dengan nama ${existingRecord.student.name
              }, kelas , untuk tanggal ${waktuAwal.toSQLDate()} sudah ada`
            );
          }
        }
      }

      const data = await DailyAttendance.updateOrCreateMany(
        "id",
        payload.daily_attendance
      );
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "ACSU101: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengubah data",
        error: message,
        error_data: error,
      });
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "DailyAttendance ID tidak valid" });
    }

    try {
      const data = await DailyAttendance.findOrFail(id);
      await data.delete();
      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      const message = "ACSU120: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }
}
