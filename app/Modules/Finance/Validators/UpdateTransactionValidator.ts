import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { TransactionMethods, TransactionStatus, TransactionTypes } from '../lib/enums'

export default class UpdateTransactionValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    coa_id: schema.string.optional({}, [
      rules.exists({ table: 'finance.coas', column: 'id' })
    ]),
    billing_id: schema.string.optional({}, [
      rules.exists({ table: 'finance.billings', column: 'id' })
    ]),
    document_id: schema.string.optional({}, [
      rules.exists({ table: 'finance.transaction_documents', column: 'id' })
    ]),
    // teller_id: schema.string.optional({}, [
    //   rules.exists({ table: 'public.employees', column: 'id' })
    // ]),
    amount: schema.number.optional(),
    method: schema.enum.optional(Object.values(TransactionMethods)),
    type: schema.enum.optional(Object.values(TransactionTypes)),
    description: schema.string.optional(),
    status: schema.enum.optional(Object.values(TransactionStatus))
  })

  public messages: CustomMessages = {}
}
