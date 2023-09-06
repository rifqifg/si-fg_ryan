import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { TransactionStatus } from '../lib/enums'

export default class UpdateTransactionDocumentValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    description: schema.string.optional({ trim: true }),
    status: schema.enum.optional(Object.values(TransactionStatus)),
    amount: schema.string.optional([
      // rules.requiredWhen('status', '=', 'approved'),
      rules.regex(new RegExp("^[1-9][0-9]*$")),
    ]),
  })

  public messages: CustomMessages = {}
}
