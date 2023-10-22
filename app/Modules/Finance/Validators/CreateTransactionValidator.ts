import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { TransactionMethods, TransactionTypes } from '../lib/enums'

export default class CreateTransactionValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    coa_id: schema.string.optional({}, [
      rules.exists({ table: 'finance.coas', column: 'id' })
    ]),
    document_id: schema.string.optional({}, [
      rules.exists({ table: 'finance.transaction_documents', column: 'id' })
    ]),
    teller_id: schema.string({}, [
      rules.exists({ table: 'public.employees', column: 'id' })
    ]),
    // amount: schema.string([
    //   rules.regex(new RegExp("^[1-9][0-9]*$")),
    // ]),
    method: schema.enum(Object.values(TransactionMethods)),
    type: schema.enum(Object.values(TransactionTypes)),
    description: schema.string.optional(),
    revenue_id: schema.string.optional([
      rules.exists({ table: 'finance.revenues', column: 'id' })
    ]),

    // TODO: validasi billing_id harus unique di array ini
    items: schema.array().members(
      schema.object().members({
        billing_id: schema.string([
          rules.exists({table: 'finance.billings', column: 'id'})
        ]),
        amount: schema.number()
      })
    )
  })

  public messages: CustomMessages = {}
}
