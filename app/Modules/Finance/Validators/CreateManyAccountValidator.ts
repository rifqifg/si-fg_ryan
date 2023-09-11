import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateManyAccountValidator {
  constructor(protected ctx: HttpContextContract, public data: {}) { }

  public schema = schema.create({
    accounts: schema.array().members(
      schema.object().members({
        coa_id: schema.string.optional([
          rules.exists({ table: 'finance.coas', column: 'id' })
        ]),
        student_id: schema.string.optional([
          rules.exists({ table: 'academic.students', column: 'id' })
        ]),
        // employee_id: schema.string.optional([
        //   rules.exists({ table: 'public.employees', column: 'id' })
        // ]),
        // owner: schema.string.optional(),
        account_name: schema.string(),
        balance: schema.string([
          rules.regex(new RegExp("^[0-9]*$")),
        ]),
        number: schema.string([
          rules.regex(new RegExp("^[0-9]+$")),
        ]),
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
        case 'coa_id':
          cekColumn = 'Nomor COA'
          break
        case 'student_id':
          cekColumn = 'Id Siswa'
          break
        // case 'employee_id':
        //   cekColumn = ''
        //   break
        // case 'owner':
        //   cekColumn = ''
        //   break
        case 'account_name':
          cekColumn = 'Nama Akun'
          break
        case 'balance':
          cekColumn = 'Saldo'
          break
        case 'number':
          cekColumn = 'Nomor Rekening'
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
      }

      return `${number}: ${cekColumn} - ${cekRule}`
    }
  }
}
