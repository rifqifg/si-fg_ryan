import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { InterviewTopic, ScSppChoice } from '../lib/enums'
import { ClassMajor, StudentProgram } from 'App/Modules/Academic/lib/enums'

export default class CreateCandidateInterviewValidator {
  constructor(protected ctx: HttpContextContract) { }
  public schema = schema.create({
    batch_id: schema.string({ trim: true }, [
      rules.uuid({ version: 4 }),
      rules.exists({ table: 'ppdb.ppdb_batches', column: 'id' })
    ]),
    topic: schema.enum(Object.values(InterviewTopic)),
    interviewer_name: schema.string(),
    program_result: schema.enum(Object.values(StudentProgram)),
    major_result: schema.enum(Object.values(ClassMajor)),
    spp_result: schema.enum(Object.values(ScSppChoice)),
    note: schema.string.optional()
  })

  public messages: CustomMessages = {}
}
