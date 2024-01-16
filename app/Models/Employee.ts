import { DateTime } from "luxon";
import {
  afterCreate,
  BaseModel,
  beforeCreate,
  BelongsTo,
  belongsTo,
  column,
  hasMany,
  HasMany,
  HasOne,
  hasOne,
  ManyToMany,
  manyToMany,
} from "@ioc:Adonis/Lucid/Orm";
import { v4 as uuidv4 } from "uuid";
import Division from "./Division";
import Wilayah from "./Wilayah";
import EmployeeDivision from "./EmployeeDivision";
import EmployeeType from "./EmployeeType";
import Teacher from "App/Modules/Academic/Models/Teacher";
import { StatusEmployees } from "App/lib/enum";
import EmployeeUnit from "./EmployeeUnit";
let newId = "";

export default class Employee extends BaseModel {
  public serializeExtras() {
    return {
      period_of_work: this.$extras.period_of_work,
      sisa_jatah_cuti: this.$extras.sisa_jatah_cuti,
    }
  }

  @column({ isPrimary: true })
  public id: string;

  @column()
  public nip: string;

  @column()
  public nuptk: string;

  @column()
  public nik: string;

  @column()
  public lastEducationName: string | null;

  @column()
  public lastEducationMajor: string | null;

  @column.date()
  public lastEducationGraduate: DateTime | null

  @column()
  public name: string;

  @column()
  public scanPresenceRequired: boolean;

  @column()
  public birthCity: string;

  @column.date()
  public birthDay: DateTime;

  @column()
  public gender: string;

  @column()
  public address: string;

  @hasMany(() => EmployeeDivision)
  public divisions: HasMany<typeof EmployeeDivision>;

  @hasMany(() => EmployeeUnit)
  public employeeUnits: HasMany<typeof EmployeeUnit>;

  @manyToMany(() => Division, {
    pivotTable: "employee_divisions",
    pivotColumns: ["title"],
  })
  public divisi: ManyToMany<typeof Division>;

  @column()
  public employeeTypeId: string;

  @belongsTo(() => EmployeeType)
  public employeeType: BelongsTo<typeof EmployeeType>;

  @hasOne(() => Teacher)
  public teacher: HasOne<typeof Teacher>;

  @column.date()
  public dateIn: DateTime;

  @column.date()
  public dateOut: DateTime | null;

  @column()
  kodeProvinsi: string | null;

  @belongsTo(() => Wilayah, {
    localKey: "kode",
    foreignKey: "kodeProvinsi",
  })
  provinsi: BelongsTo<typeof Wilayah>;

  @column()
  kodeKota: string | null;

  @belongsTo(() => Wilayah, {
    localKey: "kode",
    foreignKey: "kodeKota",
  })
  kota: BelongsTo<typeof Wilayah>;

  @column()
  kodeKecamatan: string | null;

  @belongsTo(() => Wilayah, {
    localKey: "kode",
    foreignKey: "kodeKecamatan",
  })
  kecamatan: BelongsTo<typeof Wilayah>;

  @column()
  kodeKelurahan: string | null;

  @belongsTo(() => Wilayah, {
    localKey: "kode",
    foreignKey: "kodeKelurahan",
  })
  kelurahan: BelongsTo<typeof Wilayah>;

  @column()
  public rfid: string | null;

  @column()
  defaultPresence: number | null;

  @column()
  public status: StatusEmployees

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeCreate()
  public static assignUuid(employee: Employee) {
    newId = uuidv4();
    employee.id = newId;
  }

  @afterCreate()
  public static setNewId(employee: Employee) {
    employee.id = newId;
  }
}
