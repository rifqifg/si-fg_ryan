import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from "@ioc:Adonis/Core/Validator";
import fs from "fs";
import XLSX from "xlsx";
import { HttpContext } from '@adonisjs/core/build/standalone';
import CreateManyRevenueValidator from '../../Validators/CreateManyRevenueValidator';
import { validator } from '@ioc:Adonis/Core/Validator'
import Account from '../../Models/Account';
import { RevenueStatus } from '../../lib/enums';
import Revenue from '../../Models/Revenue';

export default class RevenuesController {
    public async import({ request, response }: HttpContextContract) {

        const excelSchema = schema.create({ upload: schema.file({ extnames: ['xlsx', 'csv'] }) })

        let payload = await request.validate({ schema: excelSchema })

        const excelBuffer = fs.readFileSync(payload.upload.tmpPath?.toString()!);
        const jsonData = await RevenuesController.spreadsheetToJSON(excelBuffer)

        if (jsonData == 0) return response.badRequest({ message: "Data tidak boleh kosong" })

        const wrappedJson = { "revenues": jsonData }

        const manyRevenueValidator = new CreateManyRevenueValidator(HttpContext.get()!, wrappedJson)
        const payloadRevenue = await validator.validate(manyRevenueValidator)

        try {
            const data = await Revenue.createMany(payloadRevenue.revenues)

            response.created({ message: "Berhasil import data", data })
        } catch (error) {
            const message = "FAC-IMP: " + error.message || error;
            response.badRequest({
                message: "Gagal import data",
                error: message,
            })
        }
    }

  private static async spreadsheetToJSON(excelBuffer) {
    let workbook = await XLSX.read(excelBuffer)

    // Mendapatkan daftar nama sheet dalam workbook
    const sheetNames = workbook.SheetNames

    // membaca isi dari sheet pertama
    const firstSheet = workbook.Sheets[sheetNames[0]]
    const jsonData: Array<object> = XLSX.utils.sheet_to_json(firstSheet)

    if (jsonData.length < 1) return 0

    const formattedJson = await Promise.all(jsonData.map(async data => {
        // from chatgpt:
        // Subtracting 25569 from the serial number adjusts for the difference in the way Excel and JavaScript represent dates. In Excel, the date serial number is based on the number of days since January 1, 1900, while JavaScript uses January 1, 1970, as its reference point.
        // Multiplying by 86400 converts the serial number from days to seconds, as there are 86,400 seconds in a day.
        // Finally, multiplying by 1000 converts the seconds to milliseconds, which is the unit of time used by JavaScript's Date object.
        const jsDate = new Date((data["Tanggal"] - 25569) * 86400 * 1000)

        // from pak bani:
        // "Setiap transaksi dikenakan biaya Rp 3000.
        // Jadi data transaksi yg tersimpan di bsi (aka. dari excel) berkurang 3000.
        // Seharusnya yg tampil tetap, tidak dikurangi 3000."
        const fixedNominal = data["Nominal"] + 3000

        const noPembayaran = data["No Pembayaran"].toString()
        const account = await Account.query().where('number', noPembayaran).firstOrFail()

        return {
            from_account: account.id,
            time_received: jsDate,
            amount: fixedNominal,
            status: RevenueStatus.NEW
        }
    }))

    return formattedJson
  }
}
