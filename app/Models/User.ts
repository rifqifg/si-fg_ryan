import { DateTime } from "luxon";
import Hash from "@ioc:Adonis/Core/Hash";
import {
  column,
  beforeSave,
  BaseModel,
  beforeCreate,
  afterCreate,
  belongsTo,
  BelongsTo,
  hasMany,
  HasMany,
} from "@ioc:Adonis/Lucid/Orm";
import { v4 as uuidv4 } from "uuid";
// import Role from "./Role";
import Employee from "./Employee";
import Division from "./Division";
import Student from "App/Modules/Academic/Models/Student";
import StudentParent from "App/Modules/Academic/Models/StudentParent";
import UserRole from "./UserRole";
let newId = "";

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: string;

  @column()
  public name: string;

  // @column()
  // public role: string | null | undefined;

  // @belongsTo(() => Role, {
  //   foreignKey: "role",
  //   localKey: "name",
  //   serializeAs: "role",
  // })
  // public roles: BelongsTo<typeof Role>;

  @hasMany(() => UserRole)
  public roles: HasMany<typeof UserRole>

  @column()
  public employeeId: string;

  @belongsTo(() => Employee)
  public employee: BelongsTo<typeof Employee>;


  @column()
  public studentId: string | null

  @belongsTo(() => Student)
  public students: BelongsTo<typeof Student>

  @column()
  public studentParentId: string

  @belongsTo(() => StudentParent)
  public studentParents: BelongsTo<typeof StudentParent>



  @column()
  public email: string;

  @column({ serializeAs: null })
  public password: string;

  @column({ serializeAs: null })
  public rememberMeToken?: string;

  @column()
  public verified: boolean;

  @column({ serializeAs: null })
  public verifyToken: string;

  @column.dateTime({ serializeAs: null })
  public verifyExpiry: DateTime;

  @column()
  public divisionId: string;

  @belongsTo(() => Division)
  public division: BelongsTo<typeof Division>;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public deletedAt: DateTime;

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password);
    }
  }

  @beforeCreate()
  public static assignUuid(user: User) {
    newId = uuidv4();
    user.id = newId;
  }

  @afterCreate()
  public static setNewId(user: User) {
    user.id = newId;
  }
}
