import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'academic.program_semesters'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').unique().notNullable()
      table.uuid('teacher_id').references('id').inTable('academic.teachers').onDelete('no action').onUpdate('cascade')
      table.uuid('subject_id').references('id').inTable('academic.subjects').onDelete('no action').onUpdate('cascade')
      table.integer('total_pertemuan').notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
