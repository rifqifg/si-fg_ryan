import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'raports'

  public async up () {
    this.schema.withSchema('academic').createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique()
      table.string('name')
      table.date('from_date')
      table.date('to_date')
      table.uuid('semester_id').references('id').inTable('academic.semesters').onDelete('set null').onUpdate('cascade')
      table.integer('academic_year_id').references('id').inTable('academic.academic_years').onDelete('set null').onUpdate('cascade')
      table.uuid('class_id').references('id').inTable('academic.classes').onDelete('set null').onUpdate('cascade')

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
