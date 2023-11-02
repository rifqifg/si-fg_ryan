import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { LeaveStatuses, StatusLeaves, TypeLeaves } from 'App/lib/enum'

export default class CreateLeaveValidator {
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
    reason: schema.string([
      rules.minLength(3)
    ]),
    fromDate: schema.date({
      format: 'yyyy-MM-dd'
    }),
    toDate: schema.date({
      format: 'yyyy-MM-dd'
    }),
    note: schema.string.optional([
      rules.minLength(3)
    ]),
    type: schema.enum(Object.values(TypeLeaves)),
    employeeId: schema.string({}, [
      rules.exists({table: 'employees', column: 'id'})
    ]),
    leaveStatus: schema.enum(Object.values(LeaveStatuses))
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
