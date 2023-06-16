import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import { AttendanceStatus } from '../lib/enums';
import Session from './Session';
import Class from './Class';
import Student from './Student';
import Subject from './Subject';
let newId = ""

export default class LessonAttendance extends BaseModel {
  public static table = 'academic.lesson_attendances';

  public serializeExtras() {
    return {
      present: this.$extras.present,
      permission: this.$extras.permission,
      sick: this.$extras.sick,
      absent: this.$extras.absent,
      present_precentage: this.$extras.present_precentage,
      permission_precentage: this.$extras.permission_precentage,
      sick_precentage: this.$extras.sick_precentage,
      absent_precentage: this.$extras.absent_precentage
    }
  }

  @column({ isPrimary: true })
  public id: string

  @column.dateTime()
  public date: DateTime

  @column()
  public status: AttendanceStatus

  @column()
  public description: string

  @column()
  public sessionId: string

  @belongsTo(() => Session)
  public session: BelongsTo<typeof Session>

  @column()
  public classId: string

  @belongsTo(() => Class)
  public class: BelongsTo<typeof Class>

  @column()
  public studentId: string

  @belongsTo(() => Student)
  public student: BelongsTo<typeof Student>

  @column()
  public subjectId: string

  @belongsTo(() => Subject)
  public subject: BelongsTo<typeof Subject>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(lesson_attendance: LessonAttendance) {
    newId = uuidv4()
    lesson_attendance.id = newId
  }

  @afterCreate()
  public static setNewId(lesson_attendance: LessonAttendance) {
    lesson_attendance.id = newId
  }
}
