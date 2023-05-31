import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateUserStudentCandidateValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    nisn: schema.string({ trim: true }, [
      rules.maxLength(15),
      rules.unique({ table: 'ppdb.user_student_candidates', column: 'nisn' })
    ]),
    email: schema.string({ trim: true }, [
      rules.email(),
      // rules.unique({ table: 'ppdb.user_student_candidates', column: 'email' })
    ]),
    password: schema.string([
      rules.alphaNum({ allow: ['underscore'] }),
      rules.confirmed()
    ])
  })

  public messages: CustomMessages = {}
}
