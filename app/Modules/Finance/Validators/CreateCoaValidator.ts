import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { CoaTypes } from 'App/Modules/Finance/lib/enums'

export default class CreateCoaValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    id: schema.string([
      rules.regex(/^[0-9.]+$/),
      rules.unique({table: 'finance.coas', column: 'id'})
    ]),
    parent_coa_id: schema.string.optional([
      rules.exists({table: 'finance.coas', column: 'id'})
    ]),
    name: schema.string({trim: true}),
    type: schema.enum(Object.values(CoaTypes)),
  })

  public messages: CustomMessages = {}
}
