import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class GoogleLoginValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    cred: schema.string({ trim: true })
  })

  public messages: CustomMessages = {}
}
