import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { RevenueStatus } from '../lib/enums'

export default class UpdateRevenueValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    revenues: schema.array().members(
      schema.object().members({
        id: schema.string({}, [
          rules.exists({ table: 'finance.revenues', column: 'id' })
        ]),
        status: schema.enum.optional(Object.values(RevenueStatus))
      })
    )
  })

  public messages: CustomMessages = {}
}
