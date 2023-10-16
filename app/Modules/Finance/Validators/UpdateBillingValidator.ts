import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { BillingType } from '../lib/enums'

export default class UpdateBillingValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    billings: schema.array().members(
      schema.object().members({
        id: schema.string({}, [
          rules.exists({ table: 'finance.billings', column: 'id' })
        ]),
        account_id: schema.string.optional({}, [
          rules.exists({ table: 'finance.accounts', column: 'id' })
        ]),
        master_billing_id: schema.string.optional({}, [
          rules.exists({ table: 'finance.master_billings', column: 'id' })
        ]),
        name: schema.string.optional(),
        amount: schema.number.optional(),
        remaining_amount: schema.number.optional(),
        description: schema.string.optional(),
        type: schema.enum.optional(Object.values(BillingType))
      })
    )
  })

  public messages: CustomMessages = {}
}
