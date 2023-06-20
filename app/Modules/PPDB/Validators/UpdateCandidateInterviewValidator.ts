import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { InterviewTopic, ScSppChoice } from '../lib/enums'
import { ClassMajor, StudentProgram } from 'App/Modules/Academic/lib/enums'

export default class UpdateCandidateInterviewValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    topic: schema.enum.optional(Object.values(InterviewTopic)),
    interviewer_name: schema.string.optional(),
    program_result: schema.enum.nullableAndOptional(Object.values(StudentProgram)),
    major_result: schema.enum.nullableAndOptional(Object.values(ClassMajor)),
    spp_result: schema.enum.nullableAndOptional(Object.values(ScSppChoice)),
    note: schema.string.optional()
  })

  public messages: CustomMessages = {}
}
