import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { StudentGender, StudentReligion } from 'App/Modules/Academic/lib/enums'
import { PpdbInfoSource } from '../lib/enums'

export default class InsertScPrimaryDatumValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    name: schema.string(),
    birth_day: schema.date({ format: 'yyyy-MM-dd' }),
    junior_hs_name: schema.string(),
    gender: schema.enum(Object.values(StudentGender)),
    religion: schema.enum(Object.values(StudentReligion)),
    correspondence_phone: schema.string(),
    correspondence_email: schema.string(),
    info_source: schema.enum(Object.values(PpdbInfoSource)),
    interest_in_fg: schema.string()
  })

  public messages: CustomMessages = {}
}
