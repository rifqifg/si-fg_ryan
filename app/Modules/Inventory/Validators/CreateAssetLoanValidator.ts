import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateAssetLoanValidator {
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
    assetId: schema.string([
      rules.uuid(),
      rules.exists({
        table: 'inventory.assets',
        column: 'id',
        where: { asset_status_id: 'AVAILABLE' }
      })
    ]),
    assetLoanBatchId: schema.string.optional([
      rules.uuid(),
      rules.exists({
        table: 'inventory.asset_loan_batches',
        column: 'id',
      })
    ]),
    startDate: schema.date({ format: 'sql' }),
    endDate: schema.date.optional({ format: 'sql' }),
    studentId: schema.string.optional([
      rules.exists({ table: 'academic.students', column: 'id' }),
      rules.requiredIfNotExists('employeeId'),
    ]),
    employeeId: schema.string.optional([
      rules.exists({ table: 'employees', column: 'id' }),
      rules.requiredIfNotExists('studentId'),
    ]),

    notes: schema.string.optional()
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
    "assetId.exists": "Asset Unavailable",
    "studentId.requiredIfNotExists": "Student Id is required if Employee ID is null",
    "emplyeeId.requiredIfNotExists": "Employee Id is required if Student ID is null"
  }
}
