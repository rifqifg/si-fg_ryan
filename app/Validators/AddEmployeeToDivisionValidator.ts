import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AddEmployeeToDivisionValidator {
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

  public refs = schema.refs({
    employeeId: this.ctx.params.employee_id,
    divisionId: this.ctx.request.body().divisionId
  })

  public schema = schema.create({
    divisionId: schema.string([
      rules.exists({ table: 'divisions', column: 'id' }),
      rules.unique({
        table: 'employee_divisions', column: 'division_id', where: {
          employee_id: this.ctx.params.employee_id
        }
      })
    ]),
    title: schema.enum(['lead', 'vice', 'member'])
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
    'unique': 'Employee sudah terdaftar di divisi tersebut'
  }
}
