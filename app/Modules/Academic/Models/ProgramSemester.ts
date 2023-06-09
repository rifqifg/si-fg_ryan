import { DateTime } from "luxon";
import {
  BaseModel,
  BelongsTo,
  HasMany,
  beforeCreate,
  belongsTo,
  column,
  hasMany,
} from "@ioc:Adonis/Lucid/Orm";
import { v4 as uuidv4 } from "uuid";
import Teacher from "./Teacher";
import Subject from "./Subject";
import ProgramSemesterDetail from "./ProgramSemesterDetail";

export default class ProgramSemester extends BaseModel {
  public static table = "academic.program_semesters";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public teacherId: string;

  @column()
  public subjectId: string | null;

  @column()
  public totalPertemuan: number;

  @belongsTo(() => Teacher)
  public teachers: BelongsTo<typeof Teacher>;

  @belongsTo(() => Subject)
  public mapel: BelongsTo<typeof Subject>;

  @hasMany(() => ProgramSemesterDetail)
  public programSemesterDetail: HasMany<typeof ProgramSemesterDetail>;

  @beforeCreate()
  public static assignUuid(prosem: ProgramSemester) {
    prosem.id = uuidv4();
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
