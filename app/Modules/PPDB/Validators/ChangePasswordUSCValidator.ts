import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ChangePasswordUSCValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    current_password: schema.string({}, [
      rules.minLength(6)
    ]),
    new_password: schema.string({}, [
      rules.minLength(6),
      rules.confirmed()
    ]),
  })

  public messages: CustomMessages = {}
}
