import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class USCLoginValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.exists({ table: 'ppdb.user_student_candidates', column: 'email' })
    ]),
    password: schema.string([
      rules.alphaNum({ allow: ['underscore'] }),
    ])
  })

  public messages: CustomMessages = {}
}
