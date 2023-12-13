import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'student_raport_details'

  public async up () {
    this.schema.withSchema('academic').createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique()
      table.uuid('subject_id').references('id').inTable('academic.subjects')
      table.decimal('nilai_pengetahuan')
      table.decimal('nilai_keterampilan')
      table.string('nilai_sikap')
      table.string('keterangan_dalam_ekstrakulikuler')
      
      table.uuid('student_raport_id').references('id').inTable('academic.student_raports').onUpdate('cascade').onDelete('cascade')

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
