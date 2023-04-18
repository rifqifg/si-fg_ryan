import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { DateTime } from 'luxon';

const getAlphabet = num => 'abcdefghijklmnopqrstuvwxyz'[num]

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
        message: "Berhasil menghitung data pendaftar perbulan",
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

  public async pendaftarDiterima({ }: HttpContextContract) {
    /**
     //TODO: lanjut ini
     * PPDB  Diterima
        Progress Total Pendaftar Bulanan (Line Chart)
        Per Jurusan (Pie Chart)
        Per Program (Pie Chart)
        Presentase Sumber Info (Pie Chart)
     */

  }

  public async store({ }: HttpContextContract) { }

  public async show({ }: HttpContextContract) { }

  public async edit({ }: HttpContextContract) { }

  public async update({ }: HttpContextContract) { }

  public async destroy({ }: HttpContextContract) { }
}
