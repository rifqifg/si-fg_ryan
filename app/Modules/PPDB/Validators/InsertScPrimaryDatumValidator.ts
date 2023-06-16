import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ClassMajor, StudentGender, StudentProgram, StudentReligion } from 'App/Modules/Academic/lib/enums'
import { PpdbInfoSource, ScSppChoice } from '../lib/enums'

export default class InsertScPrimaryDatumValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    user_id: schema.string({ trim: true }, [
      rules.exists({ table: 'ppdb.user_student_candidates', column: 'id' }),
      rules.unique({ table: 'ppdb.student_candidates', column: 'user_id' })
    ]),
    birth_day: schema.date({ format: 'yyyy-MM-dd' }),
    full_name: schema.string(),
    junior_hs_name: schema.string(),
    gender: schema.enum(Object.values(StudentGender)),
    religion: schema.enum(Object.values(StudentReligion)),
    correspondence_phone: schema.string(),
    correspondence_email: schema.string([
      rules.email()
    ]),
    info_source: schema.enum(Object.values(PpdbInfoSource)),
    interest_in_fg: schema.string(),
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
