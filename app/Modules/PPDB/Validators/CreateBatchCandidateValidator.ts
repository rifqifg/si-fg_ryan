import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateBatchCandidateValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    candidate_id: schema.string({ trim: true }, [
      rules.uuid({ version: 4 }),
      rules.exists({ table: 'ppdb.student_candidates', column: 'id' })
    ]),
    batch_id: schema.string({ trim: true }, [
      rules.uuid({ version: 4 }),
      rules.exists({ table: 'ppdb.ppdb_batches', column: 'id' })
    ]),
  })

  public messages: CustomMessages = {}
}
