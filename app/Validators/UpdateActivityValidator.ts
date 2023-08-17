import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ActivityType } from 'App/lib/enum'

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
    timeInStart: schema.date.nullableAndOptional({ format: 'HH:mm:ss' }, [
      rules.requiredWhen('activityType', '=', ActivityType.FIXED_TIME)
    ]),
    timeLateStart: schema.date.nullableAndOptional({ format: 'HH:mm:ss' }, [
      rules.requiredWhen('activityType', '=', ActivityType.FIXED_TIME)
    ]),
    timeInEnd: schema.date.nullableAndOptional({ format: 'HH:mm:ss' }, [
      rules.requiredWhen('activityType', '=', ActivityType.FIXED_TIME)
    ]),
    timeOutStart: schema.date.nullableAndOptional({ format: 'HH:mm:ss' }, [
      rules.requiredWhen('activityType', '=', ActivityType.FIXED_TIME)
    ]),
    timeOutEnd: schema.date.nullableAndOptional({ format: 'HH:mm:ss' }, [
      rules.requiredWhen('activityType', '=', ActivityType.FIXED_TIME)
    ]),
    timeOutDefault: schema.date.nullableAndOptional({ format: 'HH:mm:ss' }),
    maxWorkingDuration: schema.date.optional({ format: 'HH:mm:ss' }),
    type: schema.enum.optional(['scheduled', 'standalone']),
    scheduleActive: schema.boolean.optional(),
    days: schema.string.optional(),
    division_id: schema.string.optional({}, [
      rules.exists({ table: 'divisions', column: 'id' })
    ]),
    assessment: schema.boolean.optional(),
    default: schema.number.nullableAndOptional(),
    activityType: schema.enum.optional(Object.values(ActivityType)),
    categoryActivityId: schema.string.optional({}, [
      rules.exists({ table: 'category_activities', column: 'id' })
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
