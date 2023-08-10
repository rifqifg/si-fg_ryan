import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { TeacherAttendanceStatus } from '../lib/enums'

export default class CreateTeacherAttendanceValidator {
  constructor(protected ctx: HttpContextContract) {}

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
    date_in: schema.date({
      format: 'yyyy-MM-dd HH:mm:ss'
    }),
    date_out: schema.date({
      format: 'yyyy-MM-dd HH:mm:ss'
    }),
    status: schema.enum(Object.values(TeacherAttendanceStatus)),
    material: schema.string({}, [rules.alphaNum({ allow: ['space'] })]),
    reason_not_teach: schema.string.optional({}, [rules.alphaNum({ allow: ['space'] })]),
    post_test: schema.boolean.optional(),
    classId: schema.string.optional({}, [
      rules.exists({ table: 'academic.classes', column: 'id' })
    ]),
    teacherId: schema.string({}, [
      rules.exists({ table: 'academic.teachers', column: 'id' })
    ]),
    sessionId: schema.string({}, [
      rules.exists({ table: 'academic.sessions', column: 'id' })
    ]),
    subjectId: schema.string({}, [
      rules.exists({ table: 'academic.subjects', column: 'id' })
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
    'date_in.date': "Mohon maaf, format date_in harus 'yyyy-MM-dd HH:mm:ss'",
    'date_out.date': "Mohon maaf, format date_out harus 'yyyy-MM-dd HH:mm:ss'",
    'status.enum': "Mohon maaf, status harus berisi ('teach', 'not_teach', 'exam', 'homework')",
    'post_test.boolean': "Mohon maaf, post_test harus true atau false"
  }
}
