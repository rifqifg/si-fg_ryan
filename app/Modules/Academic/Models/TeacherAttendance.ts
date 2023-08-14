import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Session from './Session'
import Class from './Class'
import Subject from './Subject'
import Teacher from './Teacher'
import { v4 as uuidv4 } from 'uuid'
import { TeacherAttendanceStatus } from '../lib/enums'
let newId = ""

export default class TeacherAttendance extends BaseModel {
  public static table = 'academic.teacher_attendances';

  public serializeExtras() {
    return {
      teach: this.$extras.teach,
      not_teach: this.$extras.not_teach,
      exam: this.$extras.exam,
      homework: this.$extras.homework,
      teach_precentage: this.$extras.teach_precentage,
      not_teach_precentage: this.$extras.not_teach_precentage,
      exam_precentage: this.$extras.exam_precentage,
      homework_precentage: this.$extras.homework_precentage
    }
  }

  @column({ isPrimary: true })
  public id: string

  @column.dateTime()
  public date_in: DateTime

  @column.dateTime()
  public date_out: DateTime

  @column()
  public status: TeacherAttendanceStatus

  @column()
  public material: string

  @column()
  public reason_not_teach: string

  @column()
  public post_test: boolean
  
  @column()
  public sessionId: string

  @belongsTo(() => Session)
  public session: BelongsTo<typeof Session>

  @column()
  public classId: string | null

  @belongsTo(() => Class)
  public class: BelongsTo<typeof Class>

  @column()
  public teacherId: string

  @belongsTo(() => Teacher)
  public teacher: BelongsTo<typeof Teacher>

  @column()
  public subjectId: string

  @belongsTo(() => Subject)
  public subject: BelongsTo<typeof Subject>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(teacher_attendance: TeacherAttendance) {
    newId = uuidv4()
    teacher_attendance.id = newId
  }

  @afterCreate()
  public static setNewId(teacher_attendance: TeacherAttendance) {
    teacher_attendance.id = newId
  }
}
