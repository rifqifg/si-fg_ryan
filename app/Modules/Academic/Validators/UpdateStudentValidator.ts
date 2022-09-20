import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateStudentValidator {
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
    name: schema.string.nullableAndOptional({}, [
      rules.alpha({ allow: ['space'] }),
      rules.minLength(5)]),
    classId: schema.string.nullableAndOptional({}, [
      rules.exists({ table: 'academic.classes', column: 'id' })
    ]),
    nik: schema.string.nullableAndOptional([
      rules.regex(/^[0-9]+$/),
      rules.unique({ table: 'academic.students', column: 'nik' })
    ]),
    email: schema.string.nullableAndOptional([
      rules.email(),
      rules.unique({ table: 'academic.students', column: 'email' })
    ]),
    nis: schema.string.nullableAndOptional([
      rules.regex(/^[0-9]+$/),
      rules.unique({ table: 'academic.students', column: 'nis' })
    ]),
    nisn: schema.string.nullableAndOptional([
      rules.regex(/^[0-9]+$/),
      rules.unique({ table: 'academic.students', column: 'nisn' })
    ]),
    birth_city: schema.string.nullableAndOptional(),
    birth_day: schema.date.nullableAndOptional(),
    religion: schema.string.nullableAndOptional(),
    address: schema.string.nullableAndOptional(),
    rt: schema.string.nullableAndOptional([
      rules.regex(/^[0-9]+$/),
    ]),
    rw: schema.string.nullableAndOptional([
      rules.regex(/^[0-9]+$/),
    ]),
    desa: schema.string.nullableAndOptional(),
    kel: schema.string.nullableAndOptional(),
    kec: schema.string.nullableAndOptional(),
    kot: schema.string.nullableAndOptional(),
    prov: schema.string.nullableAndOptional(),
    zip: schema.string.nullableAndOptional([
      rules.regex(/^[0-9]+$/),
    ]),
    phone: schema.string.nullableAndOptional([
      rules.regex(/^[0-9]+$/),
    ]),
    mobilePhone: schema.string.nullableAndOptional([
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
