import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { ParentEducation, ParentRelationship } from 'App/Modules/Academic/lib/enums'

export default class extends BaseSchema {
  protected tableName = 'student_candidate_parents'

  public async up() {
    this.schema
      .withSchema('ppdb')
      .createTable(this.tableName, (table) => {
        table.uuid('id').primary().notNullable().unique()
        table.uuid('candidate_id').notNullable().references('id').inTable('ppdb.student_candidates').onDelete('cascade').onUpdate('cascade').notNullable()
        table.enum('relationship_w_student', Object.values(ParentRelationship))
        table.string('name').notNullable()
        table.date('birth_date')
        table.string('phone_number', 16)
        table.string('nik', 16).notNullable()
        table.string('occupation', 40)
        table.enum('education', Object.values(ParentEducation))
        table.string('min_salary', 10)
        table.string('max_salary', 10)
        table.string('email', 50)
        table.text('address')
        table.unique(['candidate_id', 'nik'])

        /**
         * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
         */
        table.timestamp('created_at', { useTz: true })
        table.timestamp('updated_at', { useTz: true })
      })
  }

  public async down() {
    this.schema
      .withSchema('ppdb')
      .dropTable(this.tableName)
  }
}
