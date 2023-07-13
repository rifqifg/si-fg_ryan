import { schema, CustomMessages, rules } from "@ioc:Adonis/Core/Validator";
import { ParentEducation, ParentRelationship } from "../lib/enums";

export default class CreateManyStudentParentValidator {
  constructor(public data: {}) {}

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
    manyStudentParents: schema.array().members(
      schema.object().members({
        relationship_w_student: schema.enum(Object.values(ParentRelationship)),
        studentId: schema.string({}, [
          rules.exists({ table: "academic.students", column: "id" }),
        ]),
        nik: schema.string.optional([
          rules.regex(new RegExp("^[0-9]+$")),
          rules.minLength(16),
          rules.maxLength(16),
        ]),
        name: schema.string.optional({}, [rules.minLength(5)]),
        birth_date: schema.date.optional({ format: "yyyy-MM-dd" }),
        education: schema.enum.optional(Object.values(ParentEducation)),
        occupation: schema.string.optional([
          rules.alpha({ allow: ["dash", "space", "underscore"] }),
          rules.maxLength(40),
        ]),
        min_salary: schema.string.optional([
          rules.regex(/^[0-9]+$/),
          rules.maxLength(10),
        ]),
        max_salary: schema.string.optional([
          rules.regex(/^[0-9]+$/),
          rules.maxLength(10),
        ]),
        phone_number: schema.string.optional([
          rules.regex(/^[0-9]+$/),
          rules.maxLength(16),
        ]),
        email: schema.string.optional([
          rules.email(),
          rules.maxLength(50),
          rules.unique({ table: "academic.student_parents", column: "email" }),
        ]),
        address: schema.string.optional({ trim: true }),
      })
    ),
  });

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
  public messages: CustomMessages = {};
}
