import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'lesson_attendances'

  public async up () {
    this.schema
    .withSchema('academic')
    .createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique()
      table.dateTime('date', { useTz: false }).notNullable()
      table.enum('status', ['present', 'permission', 'sick', 'absent']).notNullable()
      table.string('description')

      table.uuid('session_id').references('id').inTable('academic.sessions').onDelete('cascade').onUpdate('cascade')
      table.uuid('class_id').references('id').inTable('academic.classes').onDelete('cascade').onUpdate('cascade')
      table.uuid('student_id').references('id').inTable('academic.students').onDelete('cascade').onUpdate('cascade')
      table.uuid('subject_id').references('id').inTable('academic.subjects').onDelete('cascade').onUpdate('cascade')

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
