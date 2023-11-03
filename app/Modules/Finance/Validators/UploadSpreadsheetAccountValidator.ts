import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UploadSpreadsheetAccountValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    upload: schema.file({
      extnames: ['xlsx', 'csv']
    })
  })

  public messages: CustomMessages = {}
}
