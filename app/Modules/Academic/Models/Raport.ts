import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import Class from './Class';
import AcademicYear from './AcademicYear';
import Semester from './Semester';
import { HttpContext } from '@adonisjs/core/build/standalone';
import Student from './Student';
import StudentRaport from './StudentRaport';
let newId = ""
export default class Raport extends BaseModel {
  public static table = "academic.raports";

  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column.date()
  public fromDate: DateTime

  @column.date()
  public toDate: DateTime

  @column()
  public semesterId: string

  @column()
  public academicYearId: number

  @column()
  public classId: string

  @belongsTo(() => AcademicYear)
  public academicYear: BelongsTo<typeof AcademicYear>

  @belongsTo(() => Semester)
  public semester: BelongsTo<typeof Semester>

  @belongsTo(() => Class)
  public class: BelongsTo<typeof Class>

  @beforeCreate()
  public static assignUuid(raport: Raport) {
    newId = uuidv4()
    raport.id = newId
  }

  @afterCreate()
  public static async insertStudentRaport() {
    const {request, response} = HttpContext.get()!
    const classId = request.body().classId
    
    const students = await Student.query().where('classId',  classId)
    
    try {
      students.map( async (student) => await StudentRaport.create({studentId: student.id, raportId: newId}))
      response.ok({message: 'berhasil me-generate raport'})
    } catch (error) {
      console.log(error)
      response.badRequest({message: 'Gagal me-generate raport'})
      
    }
    
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
