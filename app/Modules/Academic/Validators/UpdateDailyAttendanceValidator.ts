import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { AttendanceStatus } from '../lib/enums'

export default class UpdateDailyAttendanceValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    daily_attendance: schema.array().members(
      schema.object().members({
        id: schema.string({}, [
          rules.exists({ table: 'academic.daily_attendances', column: 'id' })
        ]),
        date_in: schema.date.optional({
          format: 'yyyy-MM-dd HH:mm:ss'
        }),
        date_out: schema.date.optional({
          format: 'yyyy-MM-dd HH:mm:ss'
        }),
        status: schema.enum.optional(Object.values(AttendanceStatus)),
        description: schema.string.optional({}, [rules.alphaNum({ allow: ['space'] })]),
        class_id: schema.string.optional({}, [
          rules.exists({ table: 'academic.classes', column: 'id' })
        ]),
        student_id: schema.string.optional({}, [
          rules.exists({ table: 'academic.students', column: 'id' })
        ])
      })
    )
  })

  public messages: CustomMessages = {
    'status.enum': "Mohon maaf, status harus berisi ('present', 'absent', 'permission', 'sick')",
    'date_in.date': "Mohon maaf, format date_in harus 'yyyy-MM-dd HH:mm:ss'",
    'date_out.date': "Mohon maaf, format date_out harus 'yyyy-MM-dd HH:mm:ss'",
  }
}
