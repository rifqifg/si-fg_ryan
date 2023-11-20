import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'student_raports'

  public async up () {
    this.schema.withSchema('academic').createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique()
      table.uuid('student_id').references('id').inTable('academic.students').onUpdate('cascade').onDelete('cascade')
      table.uuid('raport_id').references('id').inTable('academic.raports').onUpdate('cascade').onDelete('cascade')
      table.string('deskripsi_sikap_antarmapel')
      
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
