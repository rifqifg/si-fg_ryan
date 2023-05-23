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
    let { rows: perTingkatJurusan } = await Database.rawQuery(selectTingkatJurusan)
    //TODO: yang boarding fullday belum ada

    perTingkatJurusan = perTingkatJurusan.reduce((a, x) => {
      const index = a.findIndex(v => {
        return v.tingkat == x.tingkat
      })

      const initObj = {}
      initObj['tingkat'] = x.tingkat
      initObj[x.jurusan] = x.total

      index < 0 ? a.push(initObj) : a[index][x.jurusan] = x.total
      return a
    }, [])

    response.ok({
      message: 'Berhasil mengambil data statistik siswa',
      totalSiswa: totalSiswa[0].total,
      perTingkat,
      perJurusan,
      perTingkatJurusan
    })
  }

  public async siswaKehadiran({ request, response }: HttpContextContract) {
    let { startDate, endDate, startMonth, endMonth, forceSync = 'false' } = request.qs()
    const tableSyncPresences = 'academic.sync_student_presences'

    const selectSyncedData = `
      select extract(EPOCH from now()::timestamp - created_at::timestamp)/60 last_sync
      from academic.sync_student_presences, 
      (select count(*)  total_data from ${tableSyncPresences}) x
      limit 1
    `
    const { rows: syncedData } = await Database.rawQuery(selectSyncedData)

    // return {
    //   l: syncedData.length < 1,
    //   la: +syncedData[0].last_sync > 15,
    //   forceSync,
    //   x: syncedData.length < 1 || +syncedData[0].last_sync > 15 || forceSync
    // }
    let rows = []
    if (syncedData.length < 1 || (+syncedData[0].last_sync > 15) || (forceSync === 'true')) {
      // console.log(syncedData.length < 1 || +syncedData[0].last_sync > 15 || forceSync)
      // return syncedData.length < 1 || +syncedData[0].last_sync > 15 || forceSync
      console.log("sync")
      const doc = new GoogleSpreadsheet(process.env.GOOGLE_API_SHEET_KEHADIRAN_SISWA);

      await doc.useServiceAccountAuth({
        client_email: process.env.GOOGLE_API_EMAIL,
        private_key: process.env.GOOGLE_API_PRIVATE_KEY,
      });
      await doc.loadInfo(); // loads document properties and worksheets

      const sheet = doc.sheetsByTitle['RAW MASTER'] //sheetsByTitle['Form Responses 1'];


      rows = await sheet.getRows(); // can pass in { limit, offset }


      const cleanRowSiswa = rows.map(row => {// @ts-ignore
        const [sheet, rowNumber, rawData, ...keys] = Object.keys(row)
        const clean = {}

        if (row['Tanggal'] !== '#REF!') {// @ts-ignore
          keys.forEach((key, index) => {
            clean[key.toLowerCase()] = row[key]
          })// @ts-ignore
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
          for (const x of sliceIntoChunks(cleanRowSiswa, 1000)) {
            await Database.table(tableSyncPresences).multiInsert(x)
          }
        }
      } catch (error) {
        return response.internalServerError({
          message: 'SCHR112: Gagal Pada Proses Database' + tableSyncPresences,
          error: error.message || error
        })
      }
    } else {
      console.log("not sync")
    }

    const getLastDates = `
      select distinct tanggal::date tanggal
      from ${tableSyncPresences} 
      where tanggal is not null 
      order by tanggal desc 
      limit 7 
    `

    const { rows: lastDates } = await Database.rawQuery(getLastDates)
    startDate = lastDates[lastDates.length - 1].tanggal
    endDate = lastDates[0].tanggal

    const getLastMonths = `
    select distinct substring(tanggal::date,0,8) tanggal
    from academic.sync_student_presences 
    where tanggal is not null 
    order by substring(tanggal::date,0,8) limit 3 
    `

    const { rows: lastMonths } = await Database.rawQuery(getLastMonths)
    startMonth = lastMonths[0].tanggal
    endMonth = lastMonths[lastMonths.length - 1].tanggal

    // return { startDate, endDate, startMonth, endMonth }

    const selectHarian = `
      select rekap.tanggal, rekap."status", rekap.total, concat(((rekap.total / count(ssp.id)) * 100)::integer, '%') presentase  
      from 
        (select tanggal::date, "status", count(*) total
        from ${tableSyncPresences}
        where tanggal::date between '${startDate}' and '${endDate}'
        group by tanggal::date, "status"
        order by tanggal::date) as rekap
      left join ${tableSyncPresences} ssp
        on rekap.tanggal = ssp.tanggal::date
      group by rekap.*
      order by rekap.tanggal
    `

    const selectBulanan = `
      select rekap.tanggal, rekap."status", rekap.total, concat(((rekap.total / count(ssp.id)) * 100)::integer, '%') presentase  
      from 
        (select substring(tanggal::date,0,8) tanggal, "status", count(*) total
        from ${tableSyncPresences}
        where substring(tanggal::date,0,8) between substring('${startMonth}',0,8) and substring('${endMonth}',0,8)
        group by substring(tanggal::date,0,8), "status"
        order by substring(tanggal::date,0,8)) rekap
      left join ${tableSyncPresences} ssp
        on rekap.tanggal = substring(ssp.tanggal::date,0,8)
      group by rekap.*
      order by rekap.tanggal
    `

    try {
      const { rows: dataHarian } = await Database.rawQuery(selectHarian)
      const { rows: dataBulanan } = await Database.rawQuery(selectBulanan)

      const pivot = data => {
        const statuses = data.reduce((a, v) => {
          a.push(v.status)
          return a
        }, []).filter((value, index, array) => array.indexOf(value) === index)

        const result = data.reduce((a, v) => {
          const index = a.findIndex(x => x['tanggal'] == v.tanggal)
          if (index >= 0) {
            a[index][v.status] = v.presentase
            a[index]['total' + v.status] = v.total
          } else {
            const newObj = {}
            newObj['tanggal'] = v.tanggal
            for (let stat of statuses) {
              newObj[stat] = v.status == stat ? v.presentase : ''
              newObj['total' + stat] = v.status == stat ? v.total : ''
            }
            a.push(newObj)
          }
          return a
        }, [])
        return result
      }

      response.ok({
        message: "Berhasil menghitung data kehadiran siswa",
        // dataHarian2: dataHarian,
        dataHarian: pivot(dataHarian),
        dataBulanan: pivot(dataBulanan),
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
