import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { BillingType } from '../lib/enums'

export default class UpdateAccountReferenceValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    amount: schema.number.optional(),
    type: schema.enum.optional(Object.values(BillingType), [
      rules.unique({
        table: 'finance.account_references',
        column: 'type',
        where: { account_id: this.ctx.request.body().account_id},
        whereNot: { id: this.ctx.params.id }
      })
    ])
  })

  public messages: CustomMessages = {}
}
