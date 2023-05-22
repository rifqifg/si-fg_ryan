import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { ParentEducation, ParentRelationship } from '../../lib/enums'

export default class extends BaseSchema {
  protected tableName = 'student_parents'

  public async up() {
    this.schema
      .withSchema('academic')
      .createTable(this.tableName, (table) => {
        // TODO: test cascade when parent data removed
        // TODO: test cascade when student data removed
        table.uuid('id').primary().notNullable().unique()
        table.uuid('student_id').references('id').inTable('academic.students').onDelete('cascade').onUpdate('cascade')
        table.enum('relationship_w_student', Object.values(ParentRelationship))
        table.string('nik', 16).notNullable()
        table.string('name').notNullable()
        table.date('birth_date')
        table.enum('education', Object.values(ParentEducation))
        table.string('occupation', 40)
        table.string('min_salary', 10)
        table.string('max_salary', 10)
        table.string('phone_number', 16)
        table.string('email', 50)
        table.text('address')

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