import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateActivityValidator {
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
    name: schema.string.optional(),
    description: schema.string.optional(),
    timeInStart: schema.date.optional({ format: 'HH:mm' }, []),
    timeLateStart: schema.date.optional({ format: 'HH:mm' }, [
      rules.afterField('timeInStart'),
    ]),
    timeInEnd: schema.date.optional({ format: 'HH:mm' }, []),
    timeOutStart: schema.date.optional({ format: 'HH:mm' }, []),
    timeOutEnd: schema.date.optional({ format: 'HH:mm' }, []),
    timeOutDefault: schema.date.optional({ format: 'HH:mm' }),
    maxWorkingDuration: schema.date.optional({ format: 'HH:mm:ss' }),
    type: schema.enum.optional(['scheduled', 'standalone']),
    scheduleActive: schema.boolean.optional(),
    days: schema.string.optional(),
    division_id: schema.string.optional({}, [
      rules.exists({ table: 'divisions', column: 'id' })
    ]),
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
