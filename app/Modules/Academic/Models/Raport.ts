import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, HasMany, afterCreate, afterUpdate, beforeCreate, beforeUpdate, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
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

  @hasMany(() => StudentRaport)
  public studentRaports: HasMany<typeof StudentRaport>

  @beforeCreate()
  public static assignUuid(raport: Raport) {
    newId = uuidv4()
    raport.id = newId
  }

  @afterCreate()
  public static async insertStudentRaport() {
    const {request, response} = HttpContext.get()!
    const classId = request.body().classId
    const studentRaports = request.body().studentRaports
    const hitungUlang = request.body().hitungUlang

    const students = await Student.query().where('classId',  classId)
    
    if (hitungUlang){
      try {
        console.info(students.map(student => studentRaports.find(item => item?.student_id == student?.id))            )
        students.map(async (student) => await StudentRaport.create({studentId: student.id, raportId: newId, deskripsiSikapAntarmapel: studentRaports.find(item => item?.student_id == student?.id)?.deskripsi_sikap_antarmapel}))
        response.ok({message: 'berhasil hitung ulang raport'})
      } catch (error) {
        console.log(error.message)
        return response.badRequest({message: 'Gagal me-generate raport', error: error.message || error})
      }
    } else {
      try {
        students.map( async (student) => await StudentRaport.create({studentId: student.id, raportId: newId}))
        response.ok({message: 'berhasil me-generate raport'})
      } catch (error) {
        console.log(error)
        return response.badRequest({message: 'Gagal me-generate raport'})
      }
    } 
  }

  @beforeUpdate() 
  public static async deleteStudentRaport() {
    const { request } = HttpContext.get()!
    const { id } = request.params()
    const {fromDate, toDate} = JSON.parse(request.raw()!)

    try {

      if (fromDate || toDate)  {
        await StudentRaport.query().where('raportId', id).delete()
      }
      
    } catch (error) {
      console.log(error)
    }
  }

  @afterUpdate()
  public static async updateStudentRaport() {
    const {request, response} = HttpContext.get()!
    const { id } = request.params()
    const {fromDate, toDate} = request.body()
    const studentRaports: any[] = request.body().studentRaports

    const raport = await Raport.query().where('id', id).firstOrFail()

    const students = await Student.query().where('classId',  raport.classId)
    

    try {
    if (fromDate || toDate) {
        
        students.map(async sr => await StudentRaport.create({studentId: sr.id, raportId: id, deskripsiSikapAntarmapel: studentRaports.find(item => item?.student_id == sr.id)?.deskripsi_sikap_antarmapel}))
        
        response.ok({message: 'berhasil me-generate raport'})
      }
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
