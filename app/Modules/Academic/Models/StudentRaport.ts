import { DateTime } from "luxon";
import {
  BaseModel,
  BelongsTo,
  afterCreate,
  beforeCreate,
  belongsTo,
  column,
} from "@ioc:Adonis/Lucid/Orm";
import Student from "./Student";
import { HttpContext } from "@adonisjs/core/build/standalone";
import { v4 as uuidv4 } from "uuid";
import Class from "./Class";
import Teaching from "./Teaching";
import StudentRaportDetail from "./StudentRaportDetail";
import BukuNilai from "./BukuNilai";
import Raport from "./Raport";
import { calculateRumpun, calcutaleRaportResult } from "App/Helpers/generate-raport-helper";
let newId = "";
export default class StudentRaport extends BaseModel {
  public static table = "academic.student_raports";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public studentId: string;

  @column()
  public raportId: string;

  @column()
  public deskripsiSikapAntarmapel: string

  @belongsTo(() => Student)
  public student: BelongsTo<typeof Student>;

  @belongsTo(() => Raport)
  public raport: BelongsTo<typeof Raport>

  @beforeCreate()
  public static assignUuid(studentRaport: StudentRaport) {
    newId = uuidv4();
    studentRaport.id = newId;
  }

  @afterCreate()
  public static async insertStudentRaportDetail(studentRaport: StudentRaport) {
    const { request, response } = HttpContext.get()!;
    
    const kelas = await Class.findByOrFail("id", request.body().classId);
    const teaching = await Teaching.query()
    .where("class_id", kelas.id)
    .preload("subject");
    const bukuNilai = await BukuNilai.query().select('*').andWhere(q => (q.where('classId', kelas.id), q.whereBetween('tanggalPengambilanNilai', [request.body().fromDate, request.body().toDate]), q.where('studentId', studentRaport.studentId)))
    
    const bahasaSunda = teaching.filter(teach => teach.subject.name?.toLowerCase() === 'bahasa sunda' ).map(teach => ({subjectId: teach.subjectId, name: teach.subject.name}))
    const rumpunPai = teaching.filter(teach => teach.subject.name?.toLowerCase() == 'akhlak' || teach.subject.name?.toLowerCase() == 'aqidah' || teach.subject.name?.toLowerCase() == 'fiqh' || teach.subject.name?.toLowerCase() == 'manhaj' || teach.subject.name?.toLowerCase() == 'siroh wa tarikh' || teach.subject.name?.toLowerCase() == 'tafsir' || teach.subject.name?.toLowerCase() == 'ulumul hadits' || teach.subject.name?.toLowerCase() == 'ushul fiqih').map(teach => ({subjectId: teach.subjectId, name: teach.subject.name}))
    const pai = teaching.filter(teach => teach.subject.name?.toLowerCase() == 'pendidikan agama dan budi pekerti' || teach.subject.name == 'Pendidikan Agama dan Budi Pekerti')
    const seniBudaya = teaching.filter(teach => teach.subject.name?.toLowerCase() == 'seni budaya').map(teach => ({subjectId: teach.subjectId, name: teach.subject.name}))
    const informatika = teaching.filter(teach => teach.subject.name?.toLowerCase() === 'informatika' || teach.subject.name?.toLowerCase() == 'tik').map(teach => ({subjectId: teach.subjectId, name: teach.subject.name}))
    const quran = teaching.filter(teach => teach.subject.name?.toLowerCase() === 'pendidikan al quran' || teach.subject.name === 'Pendidikan Al Quran').map(teach => ({subjectId: teach.subjectId, name: teach.subject.name}))
    const rumpunQuran = teaching.filter(teach => teach.subject.name?.toLowerCase() == 'halaqah' || teach.subject.name?.toLowerCase() == 'tahfidz').map(teach => ({subjectId: teach.subjectId, name: teach.subject.name}))
    const rumpunBahasa = teaching.filter(teach => teach?.subject.name?.toLowerCase() == 'nahwu' || teach.subject.name?.toLowerCase() == 'shorof' || teach.subject.name?.toLowerCase() == 'tabir' || teach.subject.name?.toLowerCase() == 'balaghah' || teach.subject.name?.toLowerCase() == 'mufradaat' || teach.subject.name?.toLowerCase() == 'muhadatsah' || teach.subject.name?.toLowerCase() == 'aby').map(teach => ({subjectId: teach.subjectId, name: teach.subject.name}))
    const bahasaArab = teaching.filter(teach => teach.subject.name?.toLowerCase() == 'bahasa arab').map(teach => ({subjectId: teach.subjectId, name: teach.subject.name}))
    const bahasaIndonesia = teaching.filter(teach => teach.subject.name?.toLowerCase() == 'bahasa indonesia').map(teach => ({subjectId: teach.subjectId, name: teach.subject.name}))
    const bahasaInggris = teaching.filter(teach => teach.subject.name?.toLowerCase() == 'bahasa inggris').map(teach => ({subjectId: teach.subjectId, name: teach.subject.name}))
    const sastraIndonesia = teaching.filter(teach => teach.subject.name?.toLowerCase() == 'bahasa dan sastra indonesia').map(teach => ({subjectId: teach.subjectId, name: teach.subject.name}))
    const sastraInggris = teaching.filter(teach => teach.subject.name?.toLowerCase() == 'bahasa dan sastra inggris').map(teach => ({subjectId: teach.subjectId, name: teach.subject.name}))
    const ekonomi = teaching.filter(teach => teach.subject.name?.toLowerCase() == 'ekonomi').map(teach => ({subjectId: teach.subjectId, name: teach.subject.name}))
    const antropologi = teaching.filter(teach => teach.subject.name?.toLowerCase() == 'antropologi').map(teach => ({subjectId: teach.subjectId, name: teach.subject.name}))
    const matematika = teaching.filter(teach => teach.subject.name?.toLowerCase() == 'matematika wajib').map(teach => ({subjectId: teach.subjectId, name: teach.subject.name}))
    
    const data: any[] = []
    const rawPayload: any[] = []
    
    // console.log(kelas.kelasJurusan)
    teaching.map(teach => {
      return bukuNilai.filter(bn => bn.subjectId == teach.subjectId).map(bn => ({subjectId: bn.subjectId, type: bn.type, aspekPenilaian: bn.aspekPenilaian, nilai: +bn.nilai, nilaiSikap: bn.nilaiSikap})).map(item => {
        if (item.subjectId == teach.subjectId) {
          if (item.aspekPenilaian == "PENGETAHUAN") {
            data.push({ subjectId: teach.subjectId, nilaiPengetahuan: item.nilai, type: item.type })
            return { subjectId: teach.subjectId, nilaiPengetahuan: item.nilai, type: item.type };
          } else if (item.aspekPenilaian == "KETERAMPILAN") {
            data.push({subjectId: teach.subjectId, nilaiKeterampilan: item.nilai, type: item.type })
            return {subjectId: teach.subjectId, nilaiKeterampilan: item.nilai, type: item.type };
          } else {
            data.push({subjectId: teach.subjectId, nilaiSikap: item.nilaiSikap, type: item.type })
            return {subjectId: teach.subjectId, nilaiSikap: item.nilaiSikap, type: item.type };
          }
        }
      })
    })

    teaching.map(teach => {
      return calcutaleRaportResult(data, teach.subjectId, rawPayload)
    })

    let payload: any[] = rawPayload.filter(item => !rumpunPai.map(item => item.subjectId).includes(item.subjectId)).filter(item => !rumpunQuran.map(item => item.subjectId).includes(item.subjectId)).filter(res => res.subjectId != seniBudaya[0]?.subjectId).filter(res => res.subjectId != quran[0]?.subjectId).filter(res => res.subjectId != bahasaSunda[0]?.subjectId) 
    // console.log('data',calculateRumpun(rawPayload, rumpunPai, payload, pai, 'pai'))
    // console.info('data', rumpunPai)
    if (kelas.kelasJurusan == 'BHS') {
      payload = payload.filter(item => !rumpunBahasa.map(item => item.subjectId).includes(item.subjectId)).filter(res => res.subjectId != ekonomi[0]?.subjectId).filter(res => res.subjectId != antropologi[0]?.subjectId).filter(res => res.subjectId != sastraIndonesia[0]?.subjectId).filter(res => res.subjectId != sastraInggris[0]?.subjectId)
      // console.info(calculateRumpun(rawPayload, rumpunPai, payload, pai, 'pai'))
      // console.log(calculateRumpun(rawPayload, rumpunBahasa, payload, bahasaArab, 'bahasa'))
      try {
        calculateRumpun(rawPayload, rumpunPai, payload, pai, 'pai')
        calculateRumpun(rawPayload, rumpunBahasa, payload, bahasaArab, 'bahasa')
      
        teaching.map(async t => {
          if (t.subjectId == bahasaSunda[0]?.subjectId) {
            await StudentRaportDetail.create({subjectId: t.subjectId, studentRaportId: studentRaport.id, nilaiKeterampilan: 85 , nilaiPengetahuan: 85 , nilaiSikap: "B" })
          } else if (t.subjectId == seniBudaya[0]?.subjectId) {
            await StudentRaportDetail.create({subjectId: t.subjectId, studentRaportId: studentRaport.id, nilaiKeterampilan: payload.find(res => res.subjectId === informatika[0]?.subjectId)?.nilaiKeterampilan || 0 , nilaiPengetahuan: payload.find(res => res.subjectId === informatika[0]?.subjectId)?.nilaiPengetahuan || 0, nilaiSikap: payload.find(res => res.subjectId === informatika[0]?.subjectId).nilaiSikap })
          } else if (t.subjectId == quran[0]?.subjectId) {
            await StudentRaportDetail.create({subjectId: t.subjectId, studentRaportId: studentRaport.id, nilaiKeterampilan: rawPayload.find(item => item.subjectId == rumpunQuran[0]?.subjectId)?.nilaiKeterampilan || 0, nilaiPengetahuan: rawPayload.find(item => item.subjectId == rumpunQuran[0].subjectId)?.nilaiPengetahuan || 0, nilaiSikap: rawPayload.find(item => item.subjectId == rumpunQuran[0]?.subjectId)?.nilaiSikap})
          } else if (t.subjectId == antropologi[0]?.subjectId) {
            await StudentRaportDetail.create({subjectId: t.subjectId, studentRaportId: studentRaport.id, nilaiKeterampilan: 85 , nilaiPengetahuan: 85 , nilaiSikap: "B" })
          } else if (t.subjectId == sastraIndonesia[0]?.subjectId) {
            await StudentRaportDetail.create({subjectId: t.subjectId, studentRaportId: studentRaport.id, nilaiKeterampilan: payload.find(res => res.subjectId === bahasaIndonesia[0]?.subjectId)?.nilaiKeterampilan || 0 , nilaiPengetahuan: payload.find(res => res.subjectId === bahasaIndonesia[0]?.subjectId)?.nilaiPengetahuan || 0, nilaiSikap: payload.find(res => res.subjectId === bahasaIndonesia[0]?.subjectId).nilaiSikap })
          } else if (t.subjectId == sastraInggris[0]?.subjectId) {
            await StudentRaportDetail.create({subjectId: t.subjectId, studentRaportId: studentRaport.id, nilaiKeterampilan: payload.find(res => res.subjectId === bahasaInggris[0]?.subjectId)?.nilaiKeterampilan || 0, nilaiPengetahuan: payload.find(res => res.subjectId === bahasaInggris[0]?.subjectId)?.nilaiPengetahuan || 0, nilaiSikap: payload.find(res => res.subjectId === bahasaInggris[0]?.subjectId).nilaiSikap })
          } else if (t.subjectId == ekonomi[0]?.subjectId) {
            await StudentRaportDetail.create({subjectId: t.subjectId, studentRaportId: studentRaport.id, nilaiKeterampilan: payload.find(res => res.subjectId === matematika[0]?.subjectId)?.nilaiKeterampilan || 0, nilaiPengetahuan: payload.find(res => res.subjectId === matematika[0]?.subjectId)?.nilaiPengetahuan || 0, nilaiSikap: payload.find(res => res.subjectId === matematika[0]?.subjectId).nilaiSikap })
          }

          payload.filter(res => res.subjectId == t.subjectId).map(async (res) => {
            await StudentRaportDetail.create({subjectId: t.subjectId, studentRaportId: studentRaport.id, nilaiKeterampilan: res.nilaiKeterampilan || 0, nilaiPengetahuan: res.nilaiPengetahuan || 0, nilaiSikap: res.nilaiSikap })
          }) 
        })
      } catch (error) {
        console.warn(error)
        return response.badRequest({message: 'Gagal membuat raport, pastikan anda sudah menginput semua nilai', error})
      }
    } else {

      // console.log(calculateRumpun(rawPayload, rumpunPai, payload, pai, 'pai'))
      try {
        calculateRumpun(rawPayload, rumpunPai, payload, pai, 'pai')
      
        teaching.map(async t => {
          if (t.subjectId == bahasaSunda[0]?.subjectId) {
            await StudentRaportDetail.create({subjectId: t.subjectId, studentRaportId: studentRaport.id, nilaiKeterampilan: 85 , nilaiPengetahuan: 85 , nilaiSikap: "B" })
          } else if (t.subjectId == seniBudaya[0]?.subjectId) {
            await StudentRaportDetail.create({subjectId: t.subjectId, studentRaportId: studentRaport.id, nilaiKeterampilan: payload.find(res => res.subjectId === informatika[0]?.subjectId)?.nilaiKeterampilan || 0 , nilaiPengetahuan: payload.find(res => res.subjectId === informatika[0]?.subjectId)?.nilaiPengetahuan || 0, nilaiSikap: payload.find(res => res.subjectId === informatika[0]?.subjectId).nilaiSikap })
          } else if (t.subjectId == quran[0]?.subjectId) {
            await StudentRaportDetail.create({subjectId: t.subjectId, studentRaportId: studentRaport.id, nilaiKeterampilan: rawPayload.find(item => item.subjectId == rumpunQuran[0]?.subjectId)?.nilaiKeterampilan || 0, nilaiPengetahuan: rawPayload.find(item => item.subjectId == rumpunQuran[0].subjectId)?.nilaiPengetahuan || 0, nilaiSikap: rawPayload.find(item => item.subjectId == rumpunQuran[0]?.subjectId)?.nilaiSikap})
          }
          payload.filter(res => res.subjectId == t.subjectId).map(async (res) => {
            await StudentRaportDetail.create({subjectId: t.subjectId, studentRaportId: studentRaport.id, nilaiKeterampilan: res.nilaiKeterampilan || 0, nilaiPengetahuan: res.nilaiPengetahuan || 0, nilaiSikap: res.nilaiSikap })
          }) 
        })
      } catch (error) {
        console.warn(error)
        return response.badRequest({message: 'Gagal membuat raport, pastikan anda sudah menginput semua nilai', error})
      }
    }
}
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
 