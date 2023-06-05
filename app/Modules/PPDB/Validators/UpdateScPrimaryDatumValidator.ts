import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { StudentGender, StudentReligion } from 'App/Modules/Academic/lib/enums'
import { PpdbInfoSource } from '../lib/enums'

export default class UpdateScPrimaryDatumValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    user_id: schema.string.optional({ trim: true }, [
      rules.exists({ table: 'ppdb.user_student_candidates', column: 'id' }),
      rules.unique({ table: 'ppdb.student_candidates', column: 'user_id' })
    ]),
    birth_day: schema.date.nullableAndOptional({ format: 'yyyy-MM-dd' }),
    junior_hs_name: schema.string.nullableAndOptional(),
    gender: schema.enum.nullableAndOptional(Object.values(StudentGender)),
    religion: schema.enum.nullableAndOptional(Object.values(StudentReligion)),
    correspondence_phone: schema.string.nullableAndOptional(),
    correspondence_email: schema.string.nullableAndOptional(),
    info_source: schema.enum.nullableAndOptional(Object.values(PpdbInfoSource)),
    interest_in_fg: schema.string.nullableAndOptional(),
  })

  public messages: CustomMessages = {}
}
