import { DateTime } from "luxon";
import {
  BaseModel,
  BelongsTo,
  beforeCreate,
  belongsTo,
  column,
} from "@ioc:Adonis/Lucid/Orm";
import { v4 as uuidv4 } from "uuid";
import ProgramSemesterDetail from "./ProgramSemesterDetail";
import Student from "./Student";
import Teacher from "./Teacher";
import Subject from "./Subject";
import Class from "./Class";
import Semester from "./Semester";
import AcademicYear from "./AcademicYear";

export default class BukuNilai extends BaseModel {
  public static table = "academic.buku_nilais";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public programSemesterDetailId: string;

  @column()
  public studentId: string;

  @column()
  public teacherId: string;

  @column()
  public subjectId: string;

  @column()
  public classId: string;

  @column()
  public nilai: number;

  @column()
  public nilaiSikap: string;

  @column()
  public type: string;

  @column()
  public aspekPenilaian: string;

  @column()
  public semesterId: string;

  @column()
  public academicYearId: string;

  @column()
  public material: string | null;

  @belongsTo(() => Semester)
  public semester: BelongsTo<typeof Semester>;

  @belongsTo(() => AcademicYear)
  public academicYear: BelongsTo<typeof AcademicYear>;

  @belongsTo(() => ProgramSemesterDetail)
  public programSemesterDetail: BelongsTo<typeof ProgramSemesterDetail>;

  @belongsTo(() => Student)
  public students: BelongsTo<typeof Student>;

  @belongsTo(() => Teacher)
  public teachers: BelongsTo<typeof Teacher>;

  @belongsTo(() => Subject)
  public mapels: BelongsTo<typeof Subject>;

  @belongsTo(() => Class)
  public classes: BelongsTo<typeof Class>;

  @beforeCreate()
  public static assignUuid(bn: BukuNilai) {
    bn.id = uuidv4();
  }

  @column.date()
  public tanggalPengambilanNilai: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
