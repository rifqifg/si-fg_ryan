import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateEmployeeValidator {
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
    nip: schema.string.optional(),
    name: schema.string.optional({}, [
      rules.minLength(5)
    ]),
    birthCity: schema.string.optional(),
    birthDay: schema.date.optional(),
    gender: schema.enum.optional(['L', 'P']),
    address: schema.string.optional({}, [
      rules.minLength(20)
    ]),
    divisionId: schema.string.optional({}, [
      rules.exists({ table: 'divisions', column: 'id' })
    ]),
    status: schema.enum.optional(['FULLTIME', 'PARTTIME', 'RESIGNED']),
    dateIn: schema.date.optional(),
    dateOut: schema.date.optional(),
    rfid: schema.string.optional()
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