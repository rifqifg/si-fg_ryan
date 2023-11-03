import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { CoaTypes } from '../lib/enums'

export default class UpdateCoaValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    parent_coa_id: schema.string.optional([
      rules.exists({ table: 'finance.coas', column: 'id' })
    ]),
    name: schema.string.optional({ trim: true }),
    type: schema.enum.optional(Object.values(CoaTypes)),
  })

  public messages: CustomMessages = {}
}
