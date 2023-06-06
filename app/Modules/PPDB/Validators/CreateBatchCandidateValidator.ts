import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ScSppChoice } from '../lib/enums'
import { ClassMajor, StudentProgram } from 'App/Modules/Academic/lib/enums'

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
    spp_choice: schema.enum(Object.values(ScSppChoice)),
    program_choice: schema.enum(Object.values(StudentProgram)),
    major_choice: schema.enum(Object.values(ClassMajor)),
    test_schedule_choice: schema.string({ trim: true }, [
      rules.uuid({ version: 4 }),
      rules.exists({ table: 'ppdb.entrance_exam_schedules', column: 'id' })
    ]),
  })

  public messages: CustomMessages = {}
}
