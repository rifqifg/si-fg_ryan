import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ScImageUploadValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    file: schema.file({
      size: '2mb',
      extnames: ['jpg', 'jpeg', 'gif', 'png', 'pdf']
    }),
    category: schema.enum(['photo', 'jhs_certificate', 'family_card', 'birth_certificate', 'payment_proof', 'jhs_graduation_letter_scan'])
  })

  public messages: CustomMessages = {}
}
