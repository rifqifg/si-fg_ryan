import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { TransactionStatus } from '../lib/enums'

export default class UpdateTransactionDocumentValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    description: schema.string.optional({ trim: true }),
    status: schema.enum.optional(Object.values(TransactionStatus))
  })

  public messages: CustomMessages = {}
}
