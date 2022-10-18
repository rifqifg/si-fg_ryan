import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateAssetLoanValidator {
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
    // ASSET TIDAK DAPAT DIUBAH, DELETE LOAN APABILA SALAH ASSET
    // assetId: schema.string.optional([
    //   rules.uuid(),
    //   rules.exists({
    //     table: 'inventory.assets',
    //     column: 'id',
    //     where: { asset_status_id: 'AVAILABLE' }
    //   })
    // ]),
    assetLoanBatchId: schema.string.nullableAndOptional([
      rules.uuid(),
      rules.exists({
        table: 'inventory.asset_loan_batches',
        column: 'id',
      })
    ]),
    startDate: schema.date.optional({ format: 'sql' }),
    endDate: schema.date.nullableAndOptional({ format: 'sql' }),
    studentId: schema.string.nullableAndOptional([
      rules.exists({ table: 'academic.students', column: 'id' }),
      rules.requiredWhen('employeeId', '=', null),
    ]),
    employeeId: schema.string.nullableAndOptional([
      rules.exists({ table: 'employees', column: 'id' }),
      rules.requiredWhen('studentId', '=', null),
    ]),

    notes: schema.string.nullableAndOptional()
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
