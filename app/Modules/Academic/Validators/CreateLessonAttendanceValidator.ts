import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { AttendanceStatus } from '../lib/enums'

export default class CreateLessonAttendanceValidator {
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
    lessonAttendance: schema.array().members(
      schema.object().members({
        date: schema.date({
          format: 'yyyy-MM-dd HH:mm:ss'
        }),
        status: schema.enum(Object.values(AttendanceStatus)),
        description: schema.string.optional({}, [rules.alphaNum({ allow: ['space'] })]),
        studentId: schema.string({}, [
          rules.exists({ table: 'academic.students', column: 'id' })
        ]),
        sessionId: schema.string({}, [
          rules.exists({ table: 'academic.sessions', column: 'id' })
        ]),
        subjectId: schema.string({}, [
          rules.exists({ table: 'academic.subjects', column: 'id' })
        ]),
      })
    )
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
    'lessonAttendance.*.date.date': "Mohon maaf, format date harus 'yyyy-MM-dd HH:mm:ss'",
    'lessonAttendance.*.status.enum': "Mohon maaf, status harus berisi ('present', 'absent', 'permission', 'sick')"
  }
}
