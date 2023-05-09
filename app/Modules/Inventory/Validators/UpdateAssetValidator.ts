import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateAssetValidator {
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
    modelId: schema.string.optional([
      rules.exists({ table: 'inventory.models', column: 'id' })
    ]),
    assetLocationId: schema.string.optional([
      rules.exists({ table: 'inventory.asset_locations', column: 'id' })
    ]),
    supplierId: schema.string.optional([
      rules.exists({ table: 'inventory.suppliers', column: 'id' })
    ]),
    assetStatusId: schema.string.optional([
      rules.exists({ table: 'inventory.asset_statuses', column: 'id' })
    ]),
    serial: schema.string.optional(),
    tag: schema.array.optional().members(
      schema.string([rules.alphaNum({ allow: ['dash'] })])
    ),
    purchaseDate: schema.date.optional(),
    orderNumber: schema.string.optional(),
    price: schema.string.optional(),
    warranty: schema.string.optional(),
    notes: schema.string.optional(),
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
