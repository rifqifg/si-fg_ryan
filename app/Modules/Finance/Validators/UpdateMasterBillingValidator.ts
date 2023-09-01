import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { BillingPeriod, BillingType } from '../lib/enums'

export default class UpdateMasterBillingValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string.optional(),
    period: schema.enum.optional(Object.values(BillingPeriod)),
    amount: schema.string.optional([
      rules.regex(new RegExp("^[1-9][0-9]*$")),
    ]),
    type: schema.enum.optional(Object.values(BillingType)),
    due_date: schema.date.optional({
      format: 'yyyy-MM-dd HH:mm:ss'
    }),
    description: schema.string.optional(),
  })

  public messages: CustomMessages = {}
}
