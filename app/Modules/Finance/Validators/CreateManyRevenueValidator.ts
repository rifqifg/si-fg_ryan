import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { RevenueStatus } from '../lib/enums';

export default class CreateManyRevenueValidator {
  constructor(protected ctx: HttpContextContract, public data: {}) { }

  public schema = schema.create({
    revenues: schema.array().members(
      schema.object().members({
        from_account: schema.string(),
        time_received: schema.date(),
        // account_no: schema.string([
          // tidak perlu validasi exist, sudah di tangani RevenuesController.spreadsheetToJSON()
          // rules.exists({ table: 'finance.accounts', column: 'number' })
        // ]),
        amount: schema.number([
          rules.unsigned(),
        ]),
        status: schema.enum(Object.values(RevenueStatus))
      })
    )
  })

  public messages: CustomMessages = {
    '*': (field, rule) => {
      const numberPattern = /\d+/;
      const match = field.match(numberPattern);
      let number = match ? parseInt(match[0], 10) : null;
      number! += 2;

      const column = field.split('.');

      let cekColumn;
      switch (column[2]) {
        // case 'account_no':
        //   cekColumn = 'No Pembayaran'
        //   break
        case 'time_received':
          cekColumn = 'Tanggal'
          break
        case 'amount':
          cekColumn = 'Nominal'
          break
        default:
          cekColumn = column[2]
          break
      }

      let cekRule;
      switch (rule) {
        case 'required':
          cekRule = "Data tidak boleh kosong";
          break;
        case 'regex':
          cekRule = "Data berupa angka 0 - 9";
          break;
        case 'unique':
          cekRule = "Data tidak boleh sama";
          break;
        case 'exists':
          cekRule = "Data harus ada di database";
          break;
        default:
          cekRule = rule
          break
      }

      return `Baris ${number}: ${cekColumn} - ${cekRule}`
    }
  }
}
