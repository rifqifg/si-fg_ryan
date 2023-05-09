import { DateTime, Duration } from 'luxon'
import { afterCreate, afterFetch, afterFind, BaseModel, beforeCreate, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import Activity from './Activity'
import Employee from './Employee'

let newId = ""
export default class Presence extends BaseModel {
  public serializeExtras() {
    return {
      workingTimeDiff: this.$extras.timeDiff
    }
  }

  @column({ isPrimary: true })
  public id: string

  @column()
  public activityId: string

  @belongsTo(() => Activity)
  public activity: BelongsTo<typeof Activity>

  @column()
  public employeeId: string

  @belongsTo(() => Employee)
  public employee: BelongsTo<typeof Employee>

  @column.dateTime()
  public timeIn: DateTime

  @column.dateTime()
  public timeOut: DateTime

  @column()
  public description: string

  @afterFetch()
  public static async createWorkingDuration(presences: Presence[]) {
    for (const presence of presences) {
      presence.$extras.timeDiff = await calculateWorkingTime(presence)
    }
  }

  @afterFind()
  public static async createWorkingDuration2(presence: Presence) {
    presence.$extras.timeDiff = await calculateWorkingTime(presence)
  }

  @beforeCreate()
  public static assignUuid(presence: Presence) {
    newId = uuidv4()
    presence.id = newId
  }

  @afterCreate()
  public static setNewId(presence: Presence) {
    presence.id = newId
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}

const calculateWorkingTime = async presence => {
  const isYesterday = presence.timeIn.diffNow(['day', 'hour', 'minute', 'second']).toMillis() < 0

  if (presence.timeOut) {
    const workingDuration = presence.timeOut.diff(presence.timeIn, ['hours', 'minutes', 'seconds'])
    const activity = await Activity.find(presence.activityId)
    if (activity?.maxWorkingDuration) {
      const { maxWorkingDuration } = activity
      const max = Duration.fromISOTime(maxWorkingDuration)
      let workingTimeDiff = workingDuration.minus(max).toFormat("hh:mm:ss")

      if (workingTimeDiff.indexOf("-") > 0) {
        workingTimeDiff = "-" + workingTimeDiff.split('-').join("")
      }
      return workingTimeDiff
    }
  } else if (isYesterday) { //timeOut == null && timeIn < hari ini
    const forcedTimeOut = presence.timeIn.set({ hour: 12, minute: 30, second: 0, millisecond: 0 }) //set timeOut ke jam 12:30 siang
    let workingTimeDiff = forcedTimeOut.diff(presence.timeIn, ['hours', 'minutes', 'seconds']).toFormat("hh:mm:ss")

    workingTimeDiff = "-" + workingTimeDiff.split('-').join("") //selalu minus karena tidak absen out
    return workingTimeDiff
  }
}