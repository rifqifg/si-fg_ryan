import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, HasMany, afterCreate, beforeCreate, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Employee from './Employee'
import Triwulan from './Triwulan'
import { v4 as uuidv4 } from "uuid";
import AssessmentComponent from './AssessmentComponent';
import TriwulanEmployeeDetail from './TriwulanEmployeeDetail';
let newId = "";

export default class TriwulanEmployee extends BaseModel {
  public serializeExtras() {
    return {
      total_skor: this.$extras.total_skor,
      ranking: this.$extras.ranking,
      total_skor_direct_supervisor: this.$extras.total_skor_direct_supervisor,
      total_skor_indirect_supervisor: this.$extras.total_skor_indirect_supervisor,
      period_of_assessment: this.$extras.period_of_assessment,
    }
  }

  @column({ isPrimary: true })
  public id: string

  @column()
  public other_achievements_worth_noting: string | null

  @column()
  public specific_indiscipline_that_needs_to_be_noted: string | null

  @column()
  public suggestions_and_improvements: string | null

  @column()
  public employeeId: string;

  @belongsTo(() => Employee)
  public employee: BelongsTo<typeof Employee>;

  @column()
  public triwulanId: string;

  @belongsTo(() => Triwulan)
  public triwulan: BelongsTo<typeof Triwulan>;

  @hasMany(() => TriwulanEmployeeDetail)
  public triwulanEmployeeDetail: HasMany<typeof TriwulanEmployeeDetail>

  @column()
  public directSupervisor: string[] | null

  @column()
  public indirectSupervisor: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(TriwulanEmployee: TriwulanEmployee) {
    newId = uuidv4();
    TriwulanEmployee.id = newId;
  }

  @afterCreate()
  public static async insertTriwulanEmployeeDetail(TriwulanEmployee: TriwulanEmployee) {
    try {
      const assesmentComponentId = await AssessmentComponent.query()
        .select('id')
      const assesmentComponentIdObject = JSON.parse(JSON.stringify(assesmentComponentId))
      assesmentComponentIdObject.map(async value => {
        await TriwulanEmployeeDetail.create({
          assessmentComponentId: value.id,
          directSupervisor: true,
          triwulanEmployeeId: TriwulanEmployee.id,
          skor: 0
        })
      })
      assesmentComponentIdObject.map(async value => {
        await TriwulanEmployeeDetail.create({
          assessmentComponentId: value.id,
          directSupervisor: false,
          triwulanEmployeeId: TriwulanEmployee.id,
          skor: 0
        })
      })
    } catch (error) {
      console.log(error);
    }
  }
}
