import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class DeleteTransactionBillingValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    billing_id: schema.string([
      rules.exists({ table: 'finance.billings', column: 'id' })
    ]),
    transaction_id: schema.string([
      rules.exists({ table: 'finance.transactions', column: 'id' })
    ])
  })

  public messages: CustomMessages = {}
}
