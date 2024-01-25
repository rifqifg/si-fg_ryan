import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { LeaveStatuses, StatusLeaves } from 'App/lib/enum'

export default class UpdateLeaveValidator {
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
    status: schema.enum.optional(Object.values(StatusLeaves)),
    reason: schema.string.optional([
      rules.minLength(3)
    ]),
    fromDate: schema.date.optional({
      format: 'yyyy-MM-dd'
    }),
    toDate: schema.date.optional({
      format: 'yyyy-MM-dd'
    }),
    note: schema.string.optional([
      rules.minLength(3)
    ]),
    // type: schema.enum.optional(Object.values(TypeLeaves)),
    employeeId: schema.string.optional({}, [
      rules.exists({table: 'employees', column: 'id'})
    ]),
    leaveStatus: schema.enum.optional(Object.values(LeaveStatuses)),
    unitId: schema.string.optional({}, [
      rules.exists({table: 'units', column: 'id'})
    ]),
    image: schema.file.optional({
      size: '2mb',
      extnames: ['png', 'jpg', 'jpeg'],
    }),
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
