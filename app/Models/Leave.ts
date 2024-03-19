import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { LeaveStatuses, StatusLeaves, TypeLeaves } from 'App/lib/enum'
import Employee from './Employee'
import { v4 as uuidv4 } from 'uuid'
import Unit from './Unit'
let newId = ""

export default class Leave extends BaseModel {
  public serializeExtras() {
    return {
      sisa_jatah_cuti: this.$extras.sisa_jatah_cuti,
      reasons: this.$extras.reasons,
      izin: this.$extras.izin,
      sakit: this.$extras.sakit,
      cuti: this.$extras.cuti,
      date: this.$extras.date,
    }
  }

  @column({ isPrimary: true })
  public id: string

  @column()
  public status: StatusLeaves

  @column()
  public reason: string

  @column.date()
  public fromDate: DateTime

  @column.date()
  public toDate: DateTime

  @column()
  public note: string

  @column()
  public type: TypeLeaves

  @column()
  public employeeId: string

  @belongsTo(() => Employee)
  public employee: BelongsTo<typeof Employee>

  @column()
  public leaveStatus: LeaveStatuses

  @column()
  public image: string | null

  @column()
  public unitId: string

  @belongsTo(() => Unit)
  public unit: BelongsTo<typeof Unit>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(Leave: Leave) {
    newId = uuidv4()
    Leave.id = newId
  }

  @afterCreate()
  public static setNewId(Leave: Leave) {
    Leave.id = newId
  }
}
