import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { InterviewTopic, ScSppChoice } from '../../lib/enums'
import { ClassMajor, StudentProgram } from 'App/Modules/Academic/lib/enums'

export default class extends BaseSchema {
  protected tableName = 'ppdb_interviews'

  public async up() {
    this.schema
      .withSchema('ppdb')
      .createTable(this.tableName, (table) => {
        table.uuid('id').primary().notNullable().unique()
        table.uuid('candidate_id').notNullable().references('id').inTable('ppdb.student_candidates').onDelete('cascade').onUpdate('cascade').notNullable()
        table.uuid('batch_id').references('id').inTable('ppdb.ppdb_batches').onDelete('no action').onUpdate('cascade').notNullable()
        table.enum('topic', Object.values(InterviewTopic)).notNullable()
        table.string('interviewer_name').notNullable()
        table.enum('program_result', Object.values(StudentProgram))
        table.enum('major_result', Object.values(ClassMajor))
        table.enum('spp_result', Object.values(ScSppChoice))
        table.string('note')

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
