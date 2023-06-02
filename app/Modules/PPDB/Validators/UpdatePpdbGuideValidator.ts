import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdatePpdbGuideValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    content: schema.object().anyMembers()
  })

  public messages: CustomMessages = {}
}
