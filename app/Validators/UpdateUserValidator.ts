import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateUserValidator {
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
    name: schema.string.optional({}, [
      rules.minLength(5),
      rules.escape()
    ]),
    email: schema.string.optional({}, [
      rules.email(),
      rules.unique({ table: 'users', column: 'email' })
    ]),
    employee_id: schema.string.nullableAndOptional({}, [
      rules.exists({ table: 'employees', column: 'id' })
    ]),
    division_id: schema.string.optional({}, [
      rules.exists({ table: 'divisions', column: 'id' })
    ]),
    role: schema.string.nullableAndOptional({}, [
      rules.exists({ table: 'roles', column: 'name' })
    ]),
    password: schema.string.optional({}, [
      rules.minLength(6),
      rules.confirmed()
    ]),
    verified: schema.boolean.optional()
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
