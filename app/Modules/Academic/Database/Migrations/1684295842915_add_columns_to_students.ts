import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { StudentGender, StudentProgram, StudentResidence, StudentUnit } from '../../lib/enums'

export default class extends BaseSchema {
  protected tableName = 'academic.students'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('gender', Object.values(StudentGender))
      table.enum('residence', Object.values(StudentResidence))
      table.string('transportation', 40)
      table.boolean('has_kps').defaultTo(false)
      table.string('kps_number')
      table.string('junior_hs_cert_no')
      table.boolean('has_kip').defaultTo(false)
      table.string('kip_number')
      table.boolean('name_on_kip').defaultTo(false)
      table.boolean('has_kks').defaultTo(false)
      table.string('kks_number')
      table.string('birth_cert_no')
      table.boolean('pip_eligible').defaultTo(false)
      table.string('pip_desc')
      table.string('special_needs')
      table.string('junior_hs_name')
      table.string('child_no')
      table.decimal('address_lat')
      table.decimal('address_long')
      table.string('family_card_no')
      table.decimal('weight')
      table.decimal('height')
      table.decimal('head_circumference')
      table.string('siblings', 2)
      table.integer('distance_to_school_in_km')
      table.enum('program', Object.values(StudentProgram))
      table.enum('unit', Object.values(StudentUnit))
      table.string('bank_name', 30)
      table.string('bank_account_owner', 50)
      table.string('bank_account_number', 30)
      table.string('nat_exam_no', 30)
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns(
        'gender',
        'residence',
        'transportation',
        'has_kps',
        'kps_number',
        'junior_hs_cert_no',
        'has_kip',
        'kip_number',
        'name_on_kip',
        'has_kks',
        'kks_number',
        'birth_cert_no',
        'pip_eligible',
        'pip_desc',
        'special_needs',
        'junior_hs_name',
        'child_no',
        'address_lat',
        'address_long',
        'family_card_no',
        'weight',
        'height',
        'head_circumference',
        'siblings',
        'distance_to_school_in_km',
        'program',
        'unit',
        'bank_name',
        'bank_account_owner',
        'bank_account_number',
        'nat_exam_no'
      )
    })
  }
}
