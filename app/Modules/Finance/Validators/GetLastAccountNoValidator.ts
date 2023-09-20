import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { BillingType } from '../lib/enums'

export default class GetLastAccountNoValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    type: schema.enum(Object.values([BillingType.SPP, BillingType.BP]))
  })

  public messages: CustomMessages = {}
}
