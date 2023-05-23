import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ParentEducation, ParentRelationship } from '../lib/enums'

export default class UpdateStudentParentValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    relationship_w_student: schema.enum.nullableAndOptional(Object.values(ParentRelationship)),
    nik: schema.string([
      rules.regex(new RegExp("^[0-9]+$")),
      rules.minLength(16),
      rules.maxLength(16),
    ]),
    name: schema.string({}, [
      rules.alphaNum({ allow: ['space'] }),
      rules.minLength(5)]),
    birth_date: schema.date.nullableAndOptional({ format: "yyyy-MM-dd" }),
    education: schema.enum.nullableAndOptional(Object.values(ParentEducation)),
    occupation: schema.string.nullableAndOptional([
      rules.alpha({ allow: ['dash', 'space', 'underscore'] }),
      rules.maxLength(40)
    ]),
    min_salary: schema.string.nullableAndOptional([
      rules.regex(/^[0-9]+$/),
      rules.maxLength(10)
    ]),
    max_salary: schema.string.nullableAndOptional([
      rules.regex(/^[0-9]+$/),
      rules.maxLength(10)
    ]),
    phone_number: schema.string.nullableAndOptional([
      rules.regex(/^[0-9]+$/),
      rules.maxLength(16)
    ]),
    email: schema.string.nullableAndOptional([
      rules.email(),
      rules.maxLength(50),
      rules.unique({ table: 'academic.student_parents', column: 'email' })
    ]),
    address: schema.string.nullableAndOptional({ trim: true }),
  })

  public messages: CustomMessages = {
    'regex': 'Only accept numbers'
  }
}
