import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateAccountValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    coa_id: schema.string.optional([
      rules.exists({ table: 'finance.coas', column: 'id' })
    ]),
    student_id: schema.string.optional([
      rules.exists({ table: 'academic.students', column: 'id' })
    ]),
    employee_id: schema.string.optional([
      rules.exists({ table: 'public.employees', column: 'id' })
    ]),
    owner: schema.string.optional(),
    account_name: schema.string.optional(),
    balance: schema.number.optional(),
    ref_amount: schema.number.optional(),
    number: schema.string.optional([
      rules.regex(new RegExp("^[0-9]+$")),
    ]),
  })

  public messages: CustomMessages = {}
}
