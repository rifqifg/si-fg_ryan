import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { DateTime } from 'luxon';

const getAlphabet = num => ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'x', 'y', 'z', 'aa', 'ab', 'ac', 'ad', 'ae'][num]

export default class ChartsController {
  public async pendaftarBaru({ request, response }: HttpContextContract) {

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_API_SHEET_PPDB_PENDAFTAR);

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_API_EMAIL,
      private_key: process.env.GOOGLE_API_PRIVATE_KEY,
    });
    await doc.loadInfo(); // loads document properties and worksheets

    const sheet = doc.sheetsByIndex[0] //sheetsByTitle['Form Responses 1'];
    const rows = await sheet.getRows(); // can pass in { limit, offset }

    const cleanRowPPDB = rows.map(row => {
      const [sheet, rowNumber, rawData, ...keys] = Object.keys(row)
      const clean = {}
      keys.forEach((key, index) => {
        clean[getAlphabet(index)] = row[key]
      })

      return clean
    })

    const fields = Object.keys(cleanRowPPDB[0]).map(key => key + ' text')


    const tableTempPPDBPendaftar = 'temp_ppdb_pendaftar_' + Math.floor(DateTime.now().toSeconds())

    const createTempTableQuery = `
      CREATE TABLE ${tableTempPPDBPendaftar} (${fields.join()})
    `

    const selectPendaftarPerBulan = `
      select substr(a::date::string,0,8) bulan, count(*) total
      from ${tableTempPPDBPendaftar}
      group by substr(a::date::string,0,8)
    `

    const selectTotalPendaftar = `
      select count(*) total
      from ${tableTempPPDBPendaftar}
    `

    const selectPendaftarPerJurusan = `
      select h jurusan, count(*) total
      from ${tableTempPPDBPendaftar}
      group by h
    `

    const selectPendaftarPerProgram = `
      select upper(split_part(g,' ',1)) program, count(*) total
      from ${tableTempPPDBPendaftar}
      group by split_part(g,' ',1)
    `

    const selectSumberInfo = `
      select p sumber, count(*) total
      from ${tableTempPPDBPendaftar}
      group by p
    `

    try {
      // await Database.rawQuery(`SET experimental_enable_temp_tables=on`)
      await Database.rawQuery(createTempTableQuery)
      await Database.table(tableTempPPDBPendaftar).multiInsert(cleanRowPPDB)

      const { rows: totalPendaftar } = await Database.rawQuery(selectTotalPendaftar)
      const { rows: pendaftarPerbulan } = await Database.rawQuery(selectPendaftarPerBulan)
      const { rows: pendaftarPerJurusan } = await Database.rawQuery(selectPendaftarPerJurusan)
      const { rows: pendaftarPerProgram } = await Database.rawQuery(selectPendaftarPerProgram)
      const { rows: pendaftarSumberInfo } = await Database.rawQuery(selectSumberInfo)
      await Database.rawQuery('drop table ' + tableTempPPDBPendaftar)

      response.ok({
        message: "Berhasil menghitung data pendaftar",
        totalPendaftar: totalPendaftar[0].total,
        pendaftarPerbulan,
        pendaftarPerJurusan,
        pendaftarPerProgram,
        pendaftarSumberInfo,
        table_debug: tableTempPPDBPendaftar,
      })
    } catch (error) {
      return response.internalServerError({
        message: 'CHTC52: Gagal Pada Proses Database Temp ' + tableTempPPDBPendaftar,
        error: error.message || error
      })
    }
  }

  public async pendaftarDiterima({ response }: HttpContextContract) {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_API_SHEET_PPDB_DITERIMA);

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_API_EMAIL,
      private_key: process.env.GOOGLE_API_PRIVATE_KEY,
    });
    await doc.loadInfo(); // loads document properties and worksheets

    const sheet = doc.sheetsByIndex[0] //sheetsByTitle['Form Responses 1'];
    const rows = await sheet.getRows(); // can pass in { limit, offset }

    const cleanRowPPDB = rows.map(row => {
      const [sheet, rowNumber, rawData, ...keys] = Object.keys(row)
      const clean = {}

      keys.forEach((key, index) => {
        console.log(key);
        clean[getAlphabet(index)] = row[key]
      })

      return clean
    })

    const fields = Object.keys(cleanRowPPDB[0]).map(key => key + ' text')

    const tableTempPPDBDiterima = 'temp_ppdb_diterima_' + Math.floor(DateTime.now().toSeconds())

    const createTempTableQuery = `
      CREATE TABLE ${tableTempPPDBDiterima} (${fields.join()})
    `

    const selectTotalDiterima = `
      select count(*) total
      from ${tableTempPPDBDiterima}
      where upper(z) = 'DU' --or upper(z) = 'ND'
    `

    const selectDiterimaPerJurusan = `
      select j jurusan, count(*) total
      from ${tableTempPPDBDiterima}
      where upper(z) = 'DU' --or upper(z) = 'ND'
      group by j
    `
    const mahad = "MA`HAD"

    const selectDiterimaPerProgram = `
    select case
              when program = 'BD' then 'BOARDING'
              when program = 'MH' then '${mahad}'
              when program = 'FD' then 'FULLDAY'
           end program,
           total
    from 
      (select upper(y) program, count(*) total
      from ${tableTempPPDBDiterima}
      where upper(z) = 'DU' --or upper(z) = 'ND'
      group by upper(y)) x
    `

    try {
      // await Database.rawQuery(`SET experimental_enable_temp_tables=on`)
      await Database.rawQuery(createTempTableQuery)
      await Database.table(tableTempPPDBDiterima).multiInsert(cleanRowPPDB)
      const { rows: diterimaPerJurusan } = await Database.rawQuery(selectDiterimaPerJurusan)
      const { rows: diterimaPerProgram } = await Database.rawQuery(selectDiterimaPerProgram)
      const { rows: totalDiterima } = await Database.rawQuery(selectTotalDiterima)
      await Database.rawQuery('drop table ' + tableTempPPDBDiterima)

      response.ok({
        message: "Berhasil menghitung data ppdb yang diterima dan telah daftar ulang",
        totalDiterima: totalDiterima[0].total,
        diterimaPerJurusan,
        diterimaPerProgram,
        table_debug: tableTempPPDBDiterima,
      })
    } catch (error) {
      return response.internalServerError({
        message: 'CHTC155: Gagal Pada Proses Database Temp ' + tableTempPPDBDiterima,
        error: error.message || error
      })
    }
  }
}
