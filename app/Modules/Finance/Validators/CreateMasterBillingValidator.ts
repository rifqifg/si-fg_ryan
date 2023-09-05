import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { BillingPeriod, BillingType } from '../lib/enums'

export default class CreateMasterBillingValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string(),
    period: schema.enum(Object.values(BillingPeriod)),
    amount: schema.string([
      rules.regex(new RegExp("^[1-9][0-9]*$")),
    ]),
    type: schema.enum(Object.values(BillingType)),
    due_date: schema.date({
      format: 'yyyy-MM-dd HH:mm:ss'
    }),
    description: schema.string.optional(),
  })

  public messages: CustomMessages = {}
}
