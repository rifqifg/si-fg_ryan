import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateTransactionDocumentValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    file: schema.file({
      size: '2mb',
      extnames: ['png', 'jpg', 'jpeg']
    }),
    description: schema.string.optional({ trim: true })
  })

  public messages: CustomMessages = {}
}
