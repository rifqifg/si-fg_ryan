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
      .preload("subject", (s) => (s.select("*"), s.preload("bukuNilai")));
    const bukuNilai = await BukuNilai.query().select("id","nilai","type","aspekPenilaian","nilaiSikap","tanggalPengambilanNilai","studentId","subjectId").where("classId", kelas.id).whereBetween("tanggalPengambilanNilai", [request.body().fromDate,request.body().toDate,]);

    const groupedData = bukuNilai.filter(bn => bn.studentId === studentRaport.studentId).map(bn => ({subjectId: bn.subjectId, type: bn.type, aspekPenilaian: bn.aspekPenilaian, nilai: +bn.nilai, nilaiSikap: bn.nilaiSikap})).reduce((acc, item) => {
      const key = `${item.subjectId}-${item.aspekPenilaian}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});


    const bahasaSunda = teaching.filter(teach => teach.subject.name?.toLowerCase() === 'bahasa sunda' ).map(teach => ({subjectId: teach.subjectId, subject_name: teach.subject.name}))
    const rumpunPai = teaching.filter(teach => teach.subject.name?.toLowerCase() == 'akhlak' || teach.subject.name?.toLowerCase() == 'aqidah' || teach.subject.name?.toLowerCase() == 'fiqh' || teach.subject.name?.toLowerCase() == 'manhaj' || teach.subject.name?.toLowerCase() == 'siroh wa tarikh' ).map(teach => ({subjectId: teach.subjectId, subject_name: teach.subject.name}))
    const seniBudaya = teaching.filter(teach => teach.subject.name?.toLowerCase() == 'seni budaya').map(teach => ({subjectId: teach.subjectId, subject_name: teach.subject.name}))
    
    // console.log(bahasaSunda)

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
          // aspekPenilaian: group[0].aspekPenilaian,
          nilaiPengetahuan:  weightedAverage.toFixed(2),
        };
      } else if (group[0]?.aspekPenilaian == 'KETERAMPILAN') {
        return {
          subjectId: group[0].subjectId,
          // aspekPenilaian: group[0].aspekPenilaian,
          nilaiKeterampilan:  weightedAverage.toFixed(2),
        }
      }
       else {
        return {
          subjectId: group[0].subjectId,
          // aspekPenilaian: group[0].aspekPenilaian,
          nilaiSikap:   group[0]?.nilaiSikap
        };
      }
    });

    const data: any[] = result.reduce((res, current) => {
      const existingItem = res.find(item => item.subjectId === current.subjectId);
    
      if (existingItem) {
        Object.assign(existingItem, current);
      } else {
        res.push({ ...current });
      }
    
      return res;
    }, [])

// console.log(bahasaSunda)

    teaching.map(async t => {
      if (t.subjectId == bahasaSunda[0]?.subjectId) {
        await StudentRaportDetail.create({subjectId: t.subjectId, studentRaportId: studentRaport.id, nilaiKeterampilan: 85 , nilaiPengetahuan: 85 , nilaiSikap: "B" })
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
