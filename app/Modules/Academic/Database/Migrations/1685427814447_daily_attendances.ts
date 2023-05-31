import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'daily_attendances'

  public async up () {
    this.schema
    .withSchema('academic')
    .createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique()
      table.dateTime('date_in', { useTz: false }).notNullable()
      table.dateTime('date_out', { useTz: false }).notNullable()
      table.enum('status', ['present', 'permission', 'sick', 'absent']).notNullable()
      table.string('description')

      table.uuid('class_id').references('id').inTable('academic.classes').onDelete('cascade').onUpdate('cascade')
      table.uuid('student_id').references('id').inTable('academic.students').onDelete('cascade').onUpdate('cascade')
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema
    .withSchema('academic')
    .dropTable(this.tableName)
  }
}
