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
import MetodePengambilanNilai from "./MetodePengambilanNilai";
import Subject from "./Subject";
import Teacher from "./Teacher";

export default class RencanaPengambilanNilai extends BaseModel {
  public static table = "academic.rencana_pengambilan_nilais";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public programSemesterDetailId: string;

  @column()
  public metodePengambilanNilaiId: string;

  @column()
  public subjectId: string;

  @column()
  public teacherId: string

  @column()
  public topik: string;

  @column()
  public pertemuan: number

  @column()
  public presentase: number;

  @belongsTo(() => ProgramSemesterDetail)
  public programSemesterDetail: BelongsTo<typeof ProgramSemesterDetail>;

  @belongsTo(() => MetodePengambilanNilai)
  public metodePengambilanNilai: BelongsTo<typeof MetodePengambilanNilai>;

  @belongsTo(() => Subject)
  public subjects: BelongsTo<typeof Subject>

  @belongsTo(() => Teacher)
  public teachers: BelongsTo<typeof Teacher>

  @beforeCreate()
  public static assignUuid(rpn: RencanaPengambilanNilai) {
    rpn.id = uuidv4();
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
