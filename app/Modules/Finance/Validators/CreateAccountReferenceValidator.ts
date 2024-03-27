import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { BillingType } from '../lib/enums'

export default class CreateAccountReferenceValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    account_id: schema.string([
      rules.exists({ table: 'finance.accounts', column: 'id' })
    ]),
    amount: schema.number(),
    type: schema.enum(Object.values(BillingType), [
      rules.unique({
        table: 'finance.account_references',
        column: 'type',
        where: { account_id: this.ctx.request.body().account_id}})
    ])
  })

  public messages: CustomMessages = {}
}
