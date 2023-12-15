import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { BillingType } from '../lib/enums'

export default class CreateBillingValidator {
  constructor(protected ctx: HttpContextContract, public data: {}) { }

  public schema = schema.create({
    billings: schema.array().members(
      schema.object().members({
        account_id: schema.string({}, [
          rules.exists({ table: 'finance.accounts', column: 'id' })
        ]),
        master_billing_id: schema.string.optional({}, [
          rules.exists({ table: 'finance.master_billings', column: 'id' })
        ]),
        name: schema.string(),
        amount: schema.number(),
        remaining_amount: schema.number.optional(),
        due_date: schema.date.optional(),
        description: schema.string.optional(),
        type: schema.enum.optional(Object.values(BillingType)),
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
        case 'account_id':
          cekColumn = 'Nomor Rekening'
          break
        case 'master_billing_id':
          cekColumn = 'ID Master Billing'
          break
        case 'name':
          cekColumn = 'Nama Rekening'
          break
        case 'amount':
          cekColumn = 'Jumlah'
          break
        case 'description':
          cekColumn = 'Deskripsi'
          break
        case 'type':
          cekColumn = 'Tipe'
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

      return `${number}: ${cekColumn} - ${cekRule}`
    }
  }
}
