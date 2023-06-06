import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { ScSppChoice } from '../../lib/enums'
import { ClassMajor, StudentProgram } from 'App/Modules/Academic/lib/enums'

export default class extends BaseSchema {
  protected tableName = 'batch_candidates'

  public async up() {
    this.schema
      .withSchema('ppdb')
      .createTable(this.tableName, (table) => {
        table.uuid('id').primary().notNullable().unique()
        table.uuid('candidate_id').references('id').inTable('ppdb.student_candidates').onDelete('no action').onUpdate('cascade').notNullable()
        table.uuid('batch_id').references('id').inTable('ppdb.ppdb_batches').onDelete('no action').onUpdate('cascade')
        table.enum('spp_choice', Object.values(ScSppChoice))
        table.enum('program_choice', Object.values(StudentProgram))
        table.enum('major_choice', Object.values(ClassMajor))
        table.uuid('test_schedule_choice').references('id').inTable('ppdb.entrance_exam_schedules').onDelete('no action').onUpdate('cascade')
        table.unique(['candidate_id', 'batch_id'])

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
