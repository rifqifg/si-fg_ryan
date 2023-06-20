import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdatePpdbStatusValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    active: schema.boolean()
  })

  public messages: CustomMessages = {}
}
