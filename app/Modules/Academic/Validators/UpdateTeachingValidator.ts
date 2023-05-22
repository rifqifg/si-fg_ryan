import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateTeachingValidator {
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
    teacherId: schema.string.optional({}, [
      rules.exists({ table: 'academic.teachers', column: 'id' }),
      rules.unique({
        table: 'academic.teachings', column: 'teacher_id', where: {
          'class_id': this.ctx.request.body().classId,
          'subject_id': this.ctx.request.body().subjectId,
        }
      })
    ]),
    classId: schema.string.optional({}, [
      rules.exists({ table: 'academic.classes', column: 'id' }),
      rules.unique({
        table: 'academic.teachings', column: 'class_id', where: {
          'teacher_id': this.ctx.params.teacher_id,
          'subject_id': this.ctx.request.body().subjectId
        }
      })
    ]),
    subjectId: schema.string.optional({}, [
      rules.exists({ table: 'academic.subjects', column: 'id' }),
      rules.unique({
        table: 'academic.teachings', column: 'subject_id', where: {
          'teacher_id': this.ctx.params.teacher_id,
          'class_id': this.ctx.request.body().classId
        }
      })
    ])
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
  public messages: CustomMessages = {}
}
