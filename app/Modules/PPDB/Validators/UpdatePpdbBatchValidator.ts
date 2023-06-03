import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdatePpdbBatchValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    name: schema.string.optional({ trim: true }),
    academic_year: schema.string.nullableAndOptional([
      rules.exists({ table: "ppdb.academic_years", column: "year" }),
      rules.maxLength(25)
    ]),
    description: schema.string.nullableAndOptional(),
    active: schema.boolean.optional()
  })

  public messages: CustomMessages = {}
}
