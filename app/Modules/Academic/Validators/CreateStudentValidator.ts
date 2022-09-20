import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateStudentValidator {
  constructor(protected ctx: HttpContextContract) { }

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string({}, [ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string({}, [
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
    name: schema.string({}, [
      rules.alpha({ allow: ['space'] }),
      rules.minLength(5)]),
    classId: schema.string.optional({}, [
      rules.exists({ table: 'academic.classes', column: 'id' })
    ]),
    nik: schema.string.optional([
      rules.regex(/^[0-9]+$/),
      rules.unique({ table: 'academic.students', column: 'nik' })
    ]),
    email: schema.string.optional([
      rules.email(),
      rules.unique({ table: 'academic.students', column: 'email' })
    ]),
    nis: schema.string.optional([
      rules.regex(/^[0-9]+$/),
      rules.unique({ table: 'academic.students', column: 'nis' })
    ]),
    nisn: schema.string.optional([
      rules.regex(/^[0-9]+$/),
      rules.unique({ table: 'academic.students', column: 'nisn' })
    ]),
    birth_city: schema.string.optional(),
    birth_day: schema.date.optional(),
    religion: schema.string.optional(),
    address: schema.string.optional(),
    rt: schema.string.optional([
      rules.regex(/^[0-9]+$/),
    ]),
    rw: schema.string.optional([
      rules.regex(/^[0-9]+$/),
    ]),
    desa: schema.string.optional(),
    kel: schema.string.optional(),
    kec: schema.string.optional(),
    kot: schema.string.optional(),
    prov: schema.string.optional(),
    zip: schema.string.optional([
      rules.regex(/^[0-9]+$/),
    ]),
    phone: schema.string.optional([
      rules.regex(/^[0-9]+$/),
    ]),
    mobilePhone: schema.string.optional([
      rules.regex(/^[0-9]+$/),
    ]),
  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages: CustomMessages = {
    'regex': 'Only accept numbers'
  }
}
