import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, afterCreate, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Student from './Student'
import { HttpContext } from '@adonisjs/core/build/standalone';
import { v4 as uuidv4 } from 'uuid'
import Class from './Class';
import Teaching from './Teaching';
import StudentRaportDetail from './StudentRaportDetail';
import BukuNilai from './BukuNilai';
let newId = ""
export default class StudentRaport extends BaseModel {
  public static table = "academic.student_raports";
  
  @column({ isPrimary: true })
  public id: string

  @column()
  public studentId: string

  @column()
  public raportId: string

  @belongsTo(() => Student)
  public students: BelongsTo<typeof Student>

  @beforeCreate()
  public static assignUuid(studentRaport: StudentRaport) {
    newId = uuidv4()
    studentRaport.id = newId
  }


  @afterCreate()
  public static async insertStudentRaportDetail(studentRaport: StudentRaport) {
    const {request} = HttpContext.get()!

    function n(data: any, type: string) {
      const harianData = data.filter((item) => item?.type === "HARIAN");
      const utsData = data.filter((item) => item?.type === "UTS");
      const uasData = data.filter((item) => item?.type === "UAS");

      const harianSum = harianData.reduce(
        (sum, item) => sum + parseFloat(type === 'nilaiKeterampilan' ? item?.nilaiKeterampilan : item?.nilaiPengetahuan),
        0
      );
      const utsSum = utsData.reduce(
        (sum, item) => sum + parseFloat(type === 'nilaiKeterampilan' ? item?.nilaiKeterampilan : item?.nilaiPengetahuan),
        0
      );
      const uasWeightedSum =
        0.7 * ((harianSum + utsSum) / (harianData.length + utsData.length)) +
        0.3 * parseFloat(type === 'nilaiKeterampilan' ? uasData[0]?.nilaiKeterampilan : uasData[0]?.nilaiPengetahuan);

      return uasWeightedSum
    }

    const menghitunNilai = (nilai: any) => {
      const nilaiPengetahuanItems = nilai?.filter(
        (item) => "nilaiPengetahuan" in item
      );
      const nilaiKeterampilanItems = nilai?.filter(
        (item) => "nilaiKeterampilan" in item
      );
      const nilaiSikapItem = nilai?.filter(
        (item) => "nilaiSikap" in item
      );

      return {nilaiPengetahuan: n(nilaiPengetahuanItems, 'nilaiPengetahuan'),
        nilaiKeterampilan: n(nilaiKeterampilanItems, 'nilaiKeterampilan'), nilaiSikap: nilaiSikapItem[0]?.nilaiSikap
      };
    };
    const res: any[] = []
    const kelas = await Class.findByOrFail('id', request.body().classId)
    const students = await Student.query().where('classId',  kelas.id)
    const teaching = await Teaching.query().where('class_id', kelas.id).preload('subject', s => (s.select('*'), s.preload('bukuNilai')))
    const bukuNilai = await BukuNilai.query().select('id', 'nilai', 'type', 'aspekPenilaian', 'nilaiSikap', 'tanggalPengambilanNilai', 'studentId', 'subjectId').where('classId', kelas.id).whereBetween('tanggalPengambilanNilai', [request.body().fromDate, request.body().toDate])
    students.map(s => {
      res.push({studentId: s.id})
      teaching.map(t => {
        res.push({subjectId: t.subjectId})
        bukuNilai.map(bn => {
          if(bn.studentId == s.id && bn.subjectId == t.subjectId && bn !== undefined) {
            res.push({nilai: [{nilai: bn.nilai, aspekPenilaian: bn.aspekPenilaian, nilaiSikap: bn.nilaiSikap}]})
            // console.log({
            //   subjectId: t.subjectId,
            //   studentId: s.id,
            //   nilai: [
            //     {
            //       nilai: bn.nilai,
            //       aspekPenilaian: bn.aspekPenilaian,
            //       nilaiSikap: bn.nilaiSikap,
            //     },
            //   ],
            // })
          }
        })
      })
    })
    if (kelas.name == "XI MIPA 1" && kelas.kelasJurusan == "MIPA") {
      // teaching.map(async t => await StudentRaportDetail.create({subjectId: t.subjectId, studentRaportId: studentRaport.id}))
      // console.log('XI MIPA 1', teaching.map((t, i) => ({id: t.subjectId, name: t.subject.name, ke: i+1})))
      // console.log('data', data)
    }

    console.log(res)
  }
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
