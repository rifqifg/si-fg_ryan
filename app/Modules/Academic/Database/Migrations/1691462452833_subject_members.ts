import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'subject_members'

  public async up () {
    this.schema.withSchema('academic').createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique()
      table.uuid('subject_id').references('id').inTable('academic.subjects').onDelete('cascade').onUpdate('cascade')
      table.uuid('student_id').references('id').inTable('academic.students').onDelete('cascade').onUpdate('cascade')
      table.text('description').nullable()
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.withSchema('academic').dropTable(this.tableName)
  }
}
