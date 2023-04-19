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
    // const { startDate = '2023-01-01', endDate = '2023-01-31', startMonth = '2023-01-31', endMonth = '2023-01-31', forceSync = false } = request.qs()

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_API_SHEET_KEHADIRAN_SISWA);

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_API_EMAIL,
      private_key: process.env.GOOGLE_API_PRIVATE_KEY,
    });
    await doc.loadInfo(); // loads document properties and worksheets

    const sheet = doc.sheetsByTitle['RAW MASTER'] //sheetsByTitle['Form Responses 1'];
    const rows = await sheet.getRows(); // can pass in { limit, offset }


    const cleanRowSiswa = rows.map(row => {
      const [sheet, rowNumber, rawData, ...keys] = Object.keys(row)
      const clean = {}
      keys.forEach((key, index) => {
        clean[key.toLowerCase()] = row[key]
      })

      return clean
    })

    const tableSyncPresences = 'academic.sync_student_presences'

    const selectSyncedData = `
      select (now()::timestamp - created_at::timestamp)::integer last_sync, total_data
      from academic.sync_student_presences, 
      (select count(*)  total_data from ${tableSyncPresences}) x
      limit 1
    `
    const { rows: syncedData } = await Database.rawQuery(selectSyncedData)

    if (syncedData.length < 1 || +syncedData[0].last_sync > 15) {
      //TODO: kalau date created data nya udah lewat 15 menit, truncate table nya, isi ulang
      console.log("syncronizing data kehadiran siswa");
    }

    return false

    try {
      await Database.table('tableSyncPresences').multiInsert(cleanRowSiswa)
      await Database.rawQuery('drop table ' + tableSyncPresences)

      response.ok({
        message: "Berhasil menghitung data pendaftar",
        table_debug: tableSyncPresences,
      })
    } catch (error) {
      return response.internalServerError({
        message: 'CHTC52: Gagal Pada Proses Database Temp ' + tableSyncPresences,
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
