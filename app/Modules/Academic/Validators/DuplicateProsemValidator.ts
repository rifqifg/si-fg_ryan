import { schema, CustomMessages, rules } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class DuplicateProsemValidator {
  constructor(protected ctx: HttpContextContract) {}

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
    prosemId: schema.string([
      rules.uuid(),
      rules.exists({ table: "academic.program_semesters", column: "id" }),
    ]),
    classId: schema.string([
      rules.uuid(),
      rules.exists({ table: "academic.classes", column: "id" }),
      rules.unique({
        table: "academic.program_semesters",
        column: "id",
        where: {
          subject_id: this.ctx.request.body().subjectId,
          teacher_id: this.ctx.request.body().teacherId,
        },
      }),
    ]),
    teacherId: schema.string([
      rules.uuid({ version: 4 }),
      rules.unique({
        table: "academic.program_semesters",
        column: "id",
        where: {
          subject_id: this.ctx.request.body().subjectId,
          class_id: this.ctx.request.body().classId,
        },
      }),
    ]),
    subjectId: schema.string([
      rules.uuid({ version: 4 }),
      rules.unique({
        table: "academic.program_semesters",
        column: "id",
        where: {
          teacher_id: this.ctx.request.body().teacherId,
          class_id: this.ctx.request.body().classId,
        },
      }),
    ]),
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
