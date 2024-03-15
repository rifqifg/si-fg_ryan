import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { StatusEmployees } from 'App/lib/enum'

export default class CreateEmployeeValidator {
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
    nik: schema.string([rules.trim(), rules.minLength(16), rules.maxLength(16)]),
    name: schema.string({}, [
      rules.minLength(5)
    ]),
    birthCity: schema.string(),
    birthDay: schema.date({format: 'yyyy-MM-dd'}),
    gender: schema.enum(['L', 'P']),
    address: schema.string({}, [
      rules.minLength(20)
    ]),
    dateIn: schema.date({format: 'yyyy-MM-dd'}),
    dateOut: schema.date.optional({format: 'yyyy-MM-dd'}),
    rfid: schema.string.optional(),
    lastEducationName: schema.string.optional([rules.trim()]),
    lastEducationMajor: schema.string.optional([rules.trim()]),
    lastEducationGraduate: schema.date.optional({format: 'yyyy-MM-dd'}),
    kodeProvinsi: schema.string.optional([
      rules.minLength(2),
      rules.maxLength(2),
      rules.exists({ table: 'wilayah', column: 'kode' })
    ]),
    kodeKota: schema.string.optional([
      rules.minLength(5),
      rules.maxLength(5),
      rules.exists({ table: 'wilayah', column: 'kode' }),
      rules.requiredIfExists('kodeProvinsi')
    ]),
    kodeKecamatan: schema.string.optional([
      rules.minLength(8),
      rules.maxLength(8),
      rules.exists({ table: 'wilayah', column: 'kode' }),
      rules.requiredIfExists('kodeKota')
    ]),
    kodeKelurahan: schema.string.optional([
      rules.minLength(13),
      rules.maxLength(13),
      rules.exists({ table: 'wilayah', column: 'kode' }),
      rules.requiredIfExists('kodeKelurahan')
    ]),
    nuptk: schema.string.optional([rules.regex(/^\d+$/)]),
    employeeTypeId: schema.string([rules.exists({table: 'employee_types', column: 'id'})]),
    defaultPresence: schema.number.optional(),
    status: schema.enum(Object.values(StatusEmployees)),
    foundationId: schema.string.optional([rules.exists({table: 'foundation.foundations', column: 'id'})]),
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
