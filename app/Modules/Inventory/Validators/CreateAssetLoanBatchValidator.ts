import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateAssetLoanBatchValidator {
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
    employeeId: schema.string([
      rules.exists({ table: 'employees', column: 'id' })
    ]),
    type: schema.enum(['TEACH', 'WORK', 'PERSONAL', 'EVENT']),
    description: schema.string([
      rules.minLength(10)
    ]),
    startDate: schema.date({ format: 'sql' }),
    endDate: schema.date.optional(),
    assets: schema.array().members(
      schema.object().members({
        assetId: schema.string([
          rules.uuid(),
          rules.exists({
            table: 'inventory.assets',
            column: 'id',
            where: { asset_status_id: 'AVAILABLE' }
          })
        ]),
        studentId: schema.string.optional([
          rules.exists({ table: 'academic.students', column: 'id' }),
          rules.requiredIfNotExists('employeeId'),
        ]),
        emplyeeId: schema.string.optional([
          rules.exists({ table: 'emplyees', column: 'id' }),
          rules.requiredIfNotExists('studentId'),
        ]),

        notes: schema.string.optional()
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
    "assets.*.assetId.exists": "Asset Unavailable",
    "assets.*.studentId.requiredIfNotExists": "Student Id is required if Employee ID is null",
    "assets.*.emplyeeId.requiredIfNotExists": "Employee Id is required if Student ID is null"
  }
}
