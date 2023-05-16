import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { StudentGender, StudentProgram, StudentReligion, StudentResidence, StudentUnit } from '../../lib/enums'

export default class extends BaseSchema {
  protected tableName = 'students'

  public async up() {
    this.schema
      .withSchema('academic')
      .createTable(this.tableName, (table) => {
        table.uuid('id').primary().notNullable().unique()
        table.uuid('class_id').references('id').inTable('academic.classes').onDelete('no action').onUpdate('cascade')
        table.string('nik', 16).notNullable()
        table.string('name').notNullable()
        table.string('nis')
        table.string('nisn')
        table.string('birth_city')
        table.date('birth_day')
        table.enum('religion', Object.values(StudentReligion))
        table.text('address')
        table.enum('gender', Object.values(StudentGender))
        table.string('rt', 3)
        table.string('rw', 3)
        table.string('kel', 13)
        table.string('kec', 8)
        table.string('kot', 5)
        table.string('prov', 2)
        table.string('zip', 5)
        table.string('phone')
        table.string('mobile_phone')
        table.string('email')
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

        /**
         * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
         */
        table.timestamp('created_at', { useTz: true })
        table.timestamp('updated_at', { useTz: true })
      })
  }

  public async down() {
    this.schema
      .withSchema('academic')
      .dropTable(this.tableName)
  }
}
