import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'teacher_attendances'

  public async up () {
    this.schema
    .withSchema('academic')
    .createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique()
      table.dateTime('date_in', { useTz: false }).notNullable()
      table.dateTime('date_out', { useTz: false }).notNullable()
      table.enum('status', ['teach', 'not_teach', 'exam', 'homework']).notNullable()
      table.string('material').notNullable()
      table.string('reason_not_teach')
      table.boolean('post_test').defaultTo(false)

  // session_id uuid [ref: > sessions.id] //@ > bukan -, karena boleh ada banyak id session disini
  // teacher_id uuid [ref: < teachers.id] //nama guru
  // class_id uuid [ref: < classes.id] // kelas   
  // subject_id uuid [ref: < subjects.id]

      table.uuid('session_id').references('id').inTable('academic.sessions').onDelete('cascade').onUpdate('cascade')
      table.uuid('teacher_id').references('id').inTable('academic.teachers').onDelete('cascade').onUpdate('cascade')
      table.uuid('class_id').references('id').inTable('academic.classes').onDelete('cascade').onUpdate('cascade')
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
