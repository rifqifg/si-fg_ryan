import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdatePpdbSettingValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    guide_content: schema.object().anyMembers()
  })

  public messages: CustomMessages = {}
}
