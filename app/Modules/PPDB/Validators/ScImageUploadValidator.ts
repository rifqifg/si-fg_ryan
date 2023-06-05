import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ScImageUploadValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    photo: schema.file({
      size: '2mb',
      extnames: ['jpg', 'jpeg', 'gif', 'png']
    })
  })

  public messages: CustomMessages = {}
}
