import { DateTime } from "luxon";
import {
  afterCreate,
  BaseModel,
  beforeCreate,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
} from "@ioc:Adonis/Lucid/Orm";
import Class from "./Class";
import { v4 as uuidv4 } from "uuid";
import {
  StudentGender,
  StudentProgram,
  StudentReligion,
  StudentResidence,
  StudentUnit,
} from "../lib/enums";
import Wilayah from "App/Models/Wilayah";
import { hasMany } from "@ioc:Adonis/Lucid/Orm";
import StudentParent from "./StudentParent";
import SubjectMember from "Academic/Models/SubjectMember";
import Account from "App/Modules/Finance/Models/Account";
import BukuNilai from "./BukuNilai";
let newId = "";

export default class Student extends BaseModel {
  public static table = "academic.students";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public classId: string | null;

  @belongsTo(() => Class)
  public class: BelongsTo<typeof Class>;

  @column()
  public nik: string | null;

  @column()
  public name: string | null;

  @column()
  public nis: string | null;

  @column()
  public nisn: string | null;

  @column()
  public isGraduated: boolean;

  @column()
  public birthCity: string | null;

  @column.date()
  public birthDay: DateTime | null;

  @column()
  public religion: StudentReligion | null;

  @column()
  public address: string | null;

  @column()
  public gender: StudentGender | null;

  @column()
  public rt: string | null;

  @column()
  public rw: string | null;

  @column()
  public kel: string | null;

  @belongsTo(() => Wilayah, {
    localKey: "kode",
    foreignKey: "kel",
  })
  kelurahan: BelongsTo<typeof Wilayah>;

  @column()
  public kec: string | null;

  @belongsTo(() => Wilayah, {
    localKey: "kode",
    foreignKey: "kec",
  })
  kecamatan: BelongsTo<typeof Wilayah>;

  @column()
  public kot: string | null;

  @belongsTo(() => Wilayah, {
    localKey: "kode",
    foreignKey: "kot",
  })
  kota: BelongsTo<typeof Wilayah>;

  @column()
  public prov: string | null;

  @belongsTo(() => Wilayah, {
    localKey: "kode",
    foreignKey: "prov",
  })
  provinsi: BelongsTo<typeof Wilayah>;

  @column()
  public zip: string | null;

  @column()
  public phone: string | null;

  @column()
  public mobilePhone: string | null;

  @column()
  public email: string | null;

  @column()
  public residence: StudentResidence | null;

  @column()
  public transportation: string | null;

  @column()
  public hasKps: boolean;

  @column()
  public kpsNumber: string | null;

  @column()
  public juniorHsCertNo: string | null;

  @column()
  public hasKip: boolean;

  @column()
  public kipNumber: string | null;

  @column()
  public nameOnKip: boolean;

  @column()
  public hasKks: boolean;

  @column()
  public kksNumber: string | null;

  @column()
  public birthCertNo: string | null;

  @column()
  public pipEligible: boolean;

  @column()
  public pipDesc: string | null;

  @column()
  public specialNeeds: string | null;

  @column()
  public junior_hs_name: string | null;

  @column()
  public child_no: string | null;

  @column()
  public address_lat: number | null;

  @column()
  public address_long: number | null;

  @column()
  public family_card_no: string | null;

  @column()
  public weight: number | null;

  @column()
  public height: number | null;

  @column()
  public head_circumference: number | null;

  @column()
  public siblings: string | null;

  @column()
  public distance_to_school_in_km: number | null;

  @column()
  public program: StudentProgram | null;

  @column()
  public unit: StudentUnit | null;

  @column()
  public bank_name: string | null;

  @column()
  public bank_account_owner: string | null;

  @column()
  public bank_account_number: string | null;

  @column()
  public nat_exam_no: string | null;

  @hasMany(() => BukuNilai)
  public bukuNilai: HasMany<typeof BukuNilai>

  @hasMany(() => StudentParent)
  public parents: HasMany<typeof StudentParent>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime | null;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime | null;

  @beforeCreate()
  public static assignUuid(student: Student) {
    if (!student.id) {
      newId = uuidv4();
      student.id = newId;
    }
  }

  @afterCreate()
  public static setNewId(student: Student) {
    student.id = newId;
  }

  @hasMany(() => SubjectMember )
  public extracurricular : HasMany<typeof SubjectMember>

  @hasMany(() => Account )
  public accounts : HasMany<typeof Account>
}
