import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreatePpdbBatchValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    name: schema.string({ trim: true }),
    academic_year: schema.string([
      rules.exists({ table: "ppdb.academic_years", column: "year" }),
      rules.maxLength(25)
    ]),
    description: schema.string.optional()
  })

  public messages: CustomMessages = {}
}
