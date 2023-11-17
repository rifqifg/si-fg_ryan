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
    const rumpunPai = teaching.filter(teach => teach.subject.name?.toLowerCase() == 'akhlak' || teach.subject.name?.toLowerCase() == 'aqidah' || teach.subject.name?.toLowerCase() == 'fiqh' || teach.subject.name?.toLowerCase() == 'manhaj' || teach.subject.name?.toLowerCase() == 'siroh wa tarikh' ).map(teach => ({subjectId: teach.subjectId, name: teach.subject.name}))
    const pai = teaching.filter(teach => teach.subject.name?.toLowerCase() == 'pendidikan agama dan budi pekerti' || teach.subject.name == 'Pendidikan Agama dan Budi Pekerti')
    const seniBudaya = teaching.filter(teach => teach.subject.name?.toLowerCase() == 'seni budaya').map(teach => ({subjectId: teach.subjectId, subject_name: teach.subject.name}))
    const informatika = teaching.filter(teach => teach.subject.name?.toLowerCase() === 'informatika' || teach.subject.name?.toLowerCase() == 'tik').map(teach => ({subjectId: teach.subjectId, subject_name: teach.subject.name}))

    const groupedData = bukuNilai.filter(bn => bn.studentId === studentRaport.studentId).map(bn => ({subjectId: bn.subjectId, type: bn.type, aspekPenilaian: bn.aspekPenilaian, nilai: +bn.nilai, nilaiSikap: bn.nilaiSikap})).reduce((acc, item) => {
      const key = `${item.subjectId}-${item.aspekPenilaian}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {})

    

    const result: any = Object.keys(groupedData).map(key => {
      const group = groupedData[key];
      const harianSum = group.reduce((sum, item) => {
        if (item.type === 'HARIAN') {
          return sum + parseFloat(item.nilai);
        }
        return sum;
      }, 0);
    
      const utsSum = group.reduce((sum, item) => {
        if (item.type === 'UTS') {
          return sum + parseFloat(item.nilai);
        }
        return sum;
      }, 0);
    
      const uasSum = group.reduce((sum, item) => {
        if (item.type === 'UAS') {
          return sum + (0.3 * parseFloat(item.nilai));
        }
        return sum;
      }, 0);
    
      const totalSum = harianSum + utsSum;
      const weightedAverage = 0.7 * (totalSum / group.length) + uasSum;
      

      if (group[0]?.aspekPenilaian == 'PENGETAHUAN'  ) {
        return {
          subjectId: group[0].subjectId,
          nilaiPengetahuan:  weightedAverage.toFixed(2),
        };
      } else if (group[0]?.aspekPenilaian == 'KETERAMPILAN') {
        return {
          subjectId: group[0].subjectId,
          nilaiKeterampilan:  weightedAverage.toFixed(2),
        }
      }
       else {
        return {
          subjectId: group[0].subjectId,
          nilaiSikap:   group[0]?.nilaiSikap
        };
      }
    });


    const merged: any[] = result.reduce((res, current) => {
      const existingItem = res.find(item => item.subjectId === current.subjectId);
    
      if (existingItem) {
        Object.assign(existingItem, current);
      } else {
        res.push({ ...current });
      }
    
      return res;
    }, [])

    
    const data = merged.filter(item => !rumpunPai.map(item => item.subjectId).includes(item.subjectId))
    
    function avgPai(dataNilai: any[]) {
      const rumpun = dataNilai.filter(item => rumpunPai.map(item => item.subjectId).includes(item.subjectId))
      const nilaiPengetahuan = rumpun.map(item => +item.nilaiPengetahuan)
      const nilaiKeterampilan = rumpun.map(item => +item.nilaiKeterampilan)

      const avgPengetahuan = nilaiPengetahuan.reduce((acc, curr) => acc + curr, 0) / nilaiPengetahuan.length
      const avgKeterampilan = nilaiKeterampilan.reduce((acc, curr) => acc + curr, 0) / nilaiKeterampilan.length
      
      data.push({subjectId: pai[0]?.subjectId ,nilaiPengetahuan: avgPengetahuan, nilaiKeterampilan: avgKeterampilan, nilaiSikap: rumpun.find(item => item.subjectId === rumpunPai.find(rp => rp.name?.toLowerCase() == 'siroh wa tarikh')?.subjectId).nilaiSikap})
      // return {subjectId: pai[0]?.subjectId ,nilaiPengetahuan: avgPengetahuan, nilaiKeterampilan: avgKeterampilan, nilaiSikap: rumpun.find(item => item.subjectId === rumpunPai.find(rp => rp.name?.toLowerCase() == 'siroh wa tarikh')?.subjectId).nilaiSikap}
      return data
    }

    avgPai(merged)
    
    teaching.map(async t => {
      if (t.subjectId == bahasaSunda[0]?.subjectId) {
        await StudentRaportDetail.create({subjectId: t.subjectId, studentRaportId: studentRaport.id, nilaiKeterampilan: 85 , nilaiPengetahuan: 85 , nilaiSikap: "B" })
      } else if (t.subjectId == seniBudaya[0]?.subjectId) {
        await StudentRaportDetail.create({subjectId: t.subjectId, studentRaportId: studentRaport.id, nilaiKeterampilan: data.find(res => res.subjectId === informatika[0]?.subjectId).nilaiKeterampilan , nilaiPengetahuan: data.find(res => res.subjectId === informatika[0]?.subjectId).nilaiPengetahuan , nilaiSikap: data.find(res => res.subjectId === informatika[0]?.subjectId).nilaiSikap })
      }
      data.filter(res => res.subjectId == t.subjectId).map(async (res) => {
        await StudentRaportDetail.create({subjectId: t.subjectId, studentRaportId: studentRaport.id, nilaiKeterampilan: res.nilaiKeterampilan , nilaiPengetahuan: res.nilaiPengetahuan , nilaiSikap: res.nilaiSikap })
      }) 
    })
    
}
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
 