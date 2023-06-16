import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { AttendanceStatus } from '../lib/enums';
import { v4 as uuidv4 } from 'uuid'
import Class from './Class';
import Student from './Student';
let newId = ""

export default class DailyAttendance extends BaseModel {
  public static table = 'academic.daily_attendances';

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
      // students_count: this.$extras.students_count
    }
  }

  @column({ isPrimary: true })
  public id: string

  @column.dateTime()
  public date_in: DateTime

  @column.dateTime()
  public date_out: DateTime

  @column()
  public status: AttendanceStatus

  @column()
  public description: string | null

  @column()
  public classId: string

  @belongsTo(() => Class)
  public class: BelongsTo<typeof Class>

  @column()
  public studentId: string

  @belongsTo(() => Student)
  public student: BelongsTo<typeof Student>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(daily_attendance: DailyAttendance) {
    newId = uuidv4()
    daily_attendance.id = newId
  }

  @afterCreate()
  public static setNewId(daily_attendance: DailyAttendance) {
    daily_attendance.id = newId
  }
}
