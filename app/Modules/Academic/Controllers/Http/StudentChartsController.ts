import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { DateTime } from 'luxon';

export default class StudentChartsController {
  public async siswaTingkat({ response }: HttpContextContract) {
    const selectTingkat = `
      select tingkat, count(id) total
      from(select split_part(c.name,' ',1) tingkat ,split_part(c.name,' ',2) jurusan,  s.id 
          from academic.students s
          left join academic.classes c 
            on c.id = s.class_id 
          where student_status = 'AKTIF'
          order by c.name
        ) x
      group by tingkat;
    `

    const selectJurusan = `
      select jurusan, count(id) total
      from(select split_part(c.name,' ',1) tingkat ,split_part(c.name,' ',2) jurusan,  s.id 
          from academic.students s
          left join academic.classes c 
            on c.id = s.class_id 
          where student_status = 'AKTIF'
          order by c.name
        ) x
      group by jurusan;
    `

    const selectTingkatJurusan = `
      select tingkat, jurusan, count(id) total
      from(select split_part(c.name,' ',1) tingkat ,split_part(c.name,' ',2) jurusan,  s.id 
          from academic.students s
          left join academic.classes c 
            on c.id = s.class_id 
          where student_status = 'AKTIF'
          order by c.name
        ) x
      group by tingkat, jurusan
      order by tingkat, jurusan;
    `
    const { rows: totalSiswa } = await Database.rawQuery(`select count(*) total from academic.students where student_status = 'AKTIF'`)
    const { rows: perTingkat } = await Database.rawQuery(selectTingkat)
    const { rows: perJurusan } = await Database.rawQuery(selectJurusan)
    const { rows: perTingkatJurusan } = await Database.rawQuery(selectTingkatJurusan)
    //TODO: yang boarding fullday belum ada

    response.ok({
      message: 'Berhasil mengambil data statistik siswa',
      totalSiswa: totalSiswa[0].total,
      perTingkat,
      perJurusan,
      perTingkatJurusan
    })
  }

  public async siswaKehadiran({ request, response }: HttpContextContract) {
    let { startDate, endDate, startMonth, endMonth, forceSync = false } = request.qs()

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_API_SHEET_KEHADIRAN_SISWA);

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_API_EMAIL,
      private_key: process.env.GOOGLE_API_PRIVATE_KEY,
    });
    await doc.loadInfo(); // loads document properties and worksheets

    const sheet = doc.sheetsByTitle['RAW MASTER'] //sheetsByTitle['Form Responses 1'];

    const tableSyncPresences = 'academic.sync_student_presences'

    const selectSyncedData = `
      select extract(EPOCH from now()::timestamp - created_at::timestamp)/60 last_sync
      from academic.sync_student_presences, 
      (select count(*)  total_data from ${tableSyncPresences}) x
      limit 1
    `
    const { rows: syncedData } = await Database.rawQuery(selectSyncedData)

    let rows = []
    if (syncedData.length < 1 || +syncedData[0].last_sync > 15 || forceSync) {
      console.log("sync")
      rows = await sheet.getRows(); // can pass in { limit, offset }
    } else {
      console.log("not sync")
    }

    const cleanRowSiswa = rows.map(row => {
      const [sheet, rowNumber, rawData, ...keys] = Object.keys(row)
      const clean = {}

      if (row['Tanggal'] !== '#REF!') {
        keys.forEach((key, index) => {
          clean[key.toLowerCase()] = row[key]
        })
        clean['created_at'] = DateTime.now().toSQL().toString()
      }

      return clean
    })

    function sliceIntoChunks(arr, chunkSize) {
      const res: any[] = [];
      for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
      }
      return res;
    }


    try {
      if (syncedData.length < 1 || +syncedData[0].last_sync > 15 || forceSync) {
        console.log("syncronizing data kehadiran siswa");
        await Database.rawQuery('truncate table ' + tableSyncPresences)
        sliceIntoChunks(cleanRowSiswa, 1000).forEach(async x => {
          await Database.table(tableSyncPresences).multiInsert(x)
        })
      }
    } catch (error) {
      return response.internalServerError({
        message: 'SCHR112: Gagal Pada Proses Database' + tableSyncPresences,
        error: error.message || error
      })
    }

    const getLastDates = `
      select distinct tanggal::date::string tanggal
      from ${tableSyncPresences} 
      where tanggal is not null 
      order by tanggal limit 7 
    `

    const { rows: lastDates } = await Database.rawQuery(getLastDates)
    startDate = lastDates[0].tanggal
    endDate = lastDates[lastDates.length - 1].tanggal

    const getLastMonths = `
    select distinct substring(tanggal::date::string,0,8)::string tanggal
    from academic.sync_student_presences 
    where tanggal is not null 
    order by substring(tanggal::date::string,0,8) limit 3 
    `

    const { rows: lastMonths } = await Database.rawQuery(getLastMonths)
    startMonth = lastMonths[0].tanggal
    endMonth = lastMonths[lastMonths.length - 1].tanggal

    // return { startDate, endDate, startMonth, endMonth }

    const selectHarian = `
      select rekap.tanggal::string, rekap."status", rekap.total, ((rekap.total / count(ssp.id)) * 100)::integer presentase  
      from 
        (select tanggal::date, "status", count(*) total
        from ${tableSyncPresences}
        where tanggal::date between '${startDate}' and '${endDate}'
        group by tanggal::date, "status"
        order by tanggal::date) as rekap
      left join ${tableSyncPresences} ssp
        on rekap.tanggal = ssp.tanggal::date
      group by rekap.*
    `

    const selectBulanan = `
      select rekap.tanggal::string, rekap."status", rekap.total, ((rekap.total / count(ssp.id)) * 100)::integer presentase  
      from 
        (select substring(tanggal::date::string,0,8) tanggal, "status", count(*) total
        from ${tableSyncPresences}
        where substring(tanggal::date::string,0,8) between substring('${startMonth}',0,8) and substring('${endMonth}',0,8)
        group by substring(tanggal::date::string,0,8), "status"
        order by substring(tanggal::date::string,0,8)) rekap
      left join ${tableSyncPresences} ssp
        on rekap.tanggal = substring(ssp.tanggal::date::string,0,8)
      group by rekap.*
    `

    try {
      const { rows: dataHarian } = await Database.rawQuery(selectHarian)
      const { rows: dataBulanan } = await Database.rawQuery(selectBulanan)


      response.ok({
        message: "Berhasil menghitung data kehadiran siswa",
        dataHarian,
        dataBulanan,
        table_debug: tableSyncPresences,
      })
    } catch (error) {
      console.log(error);
      return response.internalServerError({
        message: 'SCHR138: Gagal Menghitung Data' + tableSyncPresences,
        error: error.message || error
      })

    }
  }

  public async store({ }: HttpContextContract) { }

  public async show({ }: HttpContextContract) { }

  public async edit({ }: HttpContextContract) { }

  public async update({ }: HttpContextContract) { }

  public async destroy({ }: HttpContextContract) { }
}
