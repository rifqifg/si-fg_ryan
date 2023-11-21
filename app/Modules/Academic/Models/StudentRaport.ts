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
  public students: BelongsTo<typeof Student>;

  @belongsTo(() => Raport)
  public raport: BelongsTo<typeof Raport>

  @beforeCreate()
  public static assignUuid(studentRaport: StudentRaport) {
    newId = uuidv4();
    studentRaport.id = newId;
  }

  @afterCreate()
  public static async insertStudentRaportDetail(studentRaport: StudentRaport) {
    const { request } = HttpContext.get()!;

    const kelas = await Class.findByOrFail("id", request.body().classId);
    const teaching = await Teaching.query()
      .where("class_id", kelas.id)
      .preload("subject");
    const bukuNilai = await BukuNilai.query().select('*').andWhere(q => (q.where('classId', kelas.id), q.whereBetween('tanggalPengambilanNilai', [request.body().fromDate, request.body().toDate]), q.where('studentId', studentRaport.studentId)))
    
    const bahasaSunda = teaching.filter(teach => teach.subject.name?.toLowerCase() === 'bahasa sunda' ).map(teach => ({subjectId: teach.subjectId, subject_name: teach.subject.name}))
    const rumpunPai = teaching.filter(teach => teach.subject.name?.toLowerCase() == 'akhlak' || teach.subject.name?.toLowerCase() == 'aqidah' || teach.subject.name?.toLowerCase() == 'fiqh' || teach.subject.name?.toLowerCase() == 'manhaj' || teach.subject.name?.toLowerCase() == 'siroh wa tarikh' || teach.subject.name?.toLowerCase() == 'tafsir' ).map(teach => ({subjectId: teach.subjectId, name: teach.subject.name}))
    const pai = teaching.filter(teach => teach.subject.name?.toLowerCase() == 'pendidikan agama dan budi pekerti' || teach.subject.name == 'Pendidikan Agama dan Budi Pekerti')
    const seniBudaya = teaching.filter(teach => teach.subject.name?.toLowerCase() == 'seni budaya').map(teach => ({subjectId: teach.subjectId, subject_name: teach.subject.name}))
    const informatika = teaching.filter(teach => teach.subject.name?.toLowerCase() === 'informatika' || teach.subject.name?.toLowerCase() == 'tik').map(teach => ({subjectId: teach.subjectId, subject_name: teach.subject.name}))
    const quran = teaching.filter(teach => teach.subject.name?.toLowerCase() === 'pendidikan al quran' || teach.subject.name === 'Pendidikan Al Quran').map(teach => ({subjectId: teach.subjectId, subject_name: teach.subject.name}))
    const rumpunQuran = teaching.filter(teach => teach.subject.name?.toLowerCase() == 'halaqah' || teach.subject.name?.toLowerCase() == 'tahfidz').map(teach => ({subjectId: teach.subjectId, subject_name: teach.subject.name}))


    const data: any[] = []
    const rawPayload: any[] = []
    
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

    const menghitunNilai = (nilai: any[], subjectId: string) => {
      const nilaiPengetahuanItems = nilai?.filter(bn => bn.subjectId == subjectId)?.filter(
        (item) => "nilaiPengetahuan" in item
      );
      const nilaiKeterampilanItems = nilai?.filter(bn => bn.subjectId == subjectId)?.filter(
        (item) => "nilaiKeterampilan" in item
      );
      const nilaiSikapItem = nilai?.filter(bn => bn.subjectId == subjectId)?.filter(
        (item) => "nilaiSikap" in item
      );

      rawPayload.push({subjectId ,nilaiPengetahuan: n(nilaiPengetahuanItems, 'nilaiPengetahuan'), nilaiKeterampilan: n(nilaiKeterampilanItems, 'nilaiKeterampilan'), nilaiSikap: nilaiSikapItem[0]?.nilaiSikap, studentId: studentRaport.studentId})
      return {subjectId ,nilaiPengetahuan: n(nilaiPengetahuanItems, 'nilaiPengetahuan'),
        nilaiKeterampilan: n(nilaiKeterampilanItems, 'nilaiKeterampilan'), nilaiSikap: nilaiSikapItem[0]?.nilaiSikap
      };
    };

    teaching.map(teach => {
      return menghitunNilai(data, teach.subjectId)
    })

    const payload: any[] = rawPayload.filter(item => !rumpunPai.map(item => item.subjectId).includes(item.subjectId)).filter(item => !rumpunQuran.map(item => item.subjectId).includes(item.subjectId)).filter(res => res.subjectId != seniBudaya[0]?.subjectId).filter(res => res.subjectId != quran[0]?.subjectId).filter(res => res.subjectId != bahasaSunda[0]?.subjectId)
    
    function avgPai(dataNilai: any[]) {
      const rumpun = dataNilai.filter(item => rumpunPai.map(item => item.subjectId).includes(item.subjectId))
      const nilaiPengetahuan = rumpun.map(item => +item.nilaiPengetahuan)
      const nilaiKeterampilan = rumpun.map(item => +item.nilaiKeterampilan)

      const avgPengetahuan = nilaiPengetahuan.reduce((acc, curr) => acc + curr, 0) / nilaiPengetahuan.length
      const avgKeterampilan = nilaiKeterampilan.reduce((acc, curr) => acc + curr, 0) / nilaiKeterampilan.length
      
      // payload.push({subjectId: pai[0]?.subjectId ,nilaiPengetahuan: avgPengetahuan, nilaiKeterampilan: avgKeterampilan, nilaiSikap: rumpun.find(item => item.subjectId === rumpunPai.find(rp => rp.name?.toLowerCase() == 'siroh wa tarikh')?.subjectId).nilaiSikap})
      payload.find(item => item.subjectId == pai[0]?.subjectId).nilaiPengetahuan = avgPengetahuan
      payload.find(item => item.subjectId == pai[0]?.subjectId).nilaiKeterampilan = avgKeterampilan
      payload.find(item => item.subjectId == pai[0]?.subjectId).nilaiSikap = rumpun.find(item => item.subjectId === rumpunPai.find(rp => rp.name?.toLowerCase() == 'siroh wa tarikh')?.subjectId).nilaiSikap
      // return {subjectId: pai[0]?.subjectId ,nilaiPengetahuan: avgPengetahuan, nilaiKeterampilan: avgKeterampilan, nilaiSikap: rumpun.find(item => item.subjectId === rumpunPai.find(rp => rp.name?.toLowerCase() == 'siroh wa tarikh')?.subjectId).nilaiSikap}
      return payload
    }

    console.log('data',avgPai(rawPayload))
    
    teaching.map(async t => {
      if (t.subjectId == bahasaSunda[0]?.subjectId) {
        await StudentRaportDetail.create({subjectId: t.subjectId, studentRaportId: studentRaport.id, nilaiKeterampilan: 85 , nilaiPengetahuan: 85 , nilaiSikap: "B" })
      } else if (t.subjectId == seniBudaya[0]?.subjectId) {
        await StudentRaportDetail.create({subjectId: t.subjectId, studentRaportId: studentRaport.id, nilaiKeterampilan: payload.find(res => res.subjectId === informatika[0]?.subjectId)?.nilaiKeterampilan , nilaiPengetahuan: payload.find(res => res.subjectId === informatika[0]?.subjectId)?.nilaiPengetahuan , nilaiSikap: payload.find(res => res.subjectId === informatika[0]?.subjectId).nilaiSikap })
      } else if (t.subjectId == quran[0]?.subjectId) {
        await StudentRaportDetail.create({subjectId: t.subjectId, studentRaportId: studentRaport.id, nilaiKeterampilan: rawPayload.find(item => item.subjectId == rumpunQuran[0]?.subjectId)?.nilaiKeterampilan, nilaiPengetahuan: rawPayload.find(item => item.subjectId == rumpunQuran[0].subjectId)?.nilaiPengetahuan, nilaiSikap: rawPayload.find(item => item.subjectId == rumpunQuran[0]?.subjectId)?.nilaiSikap})
      }
      payload.filter(res => res.subjectId == t.subjectId).map(async (res) => {
        await StudentRaportDetail.create({subjectId: t.subjectId, studentRaportId: studentRaport.id, nilaiKeterampilan: res.nilaiKeterampilan , nilaiPengetahuan: res.nilaiPengetahuan , nilaiSikap: res.nilaiSikap })
      }) 
    })
    
}
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
 