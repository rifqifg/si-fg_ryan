import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'academic.program_semester_details'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').unique().notNullable()
      table.uuid('program_semester_id').references('id').inTable('academic.program_semesters').onDelete('no action').onUpdate('cascade')
      table.uuid('kompetensi_inti_id').references('id').inTable('academic.kompetensi_intis').onDelete('no action').onUpdate('cascade')
      table.string('kompetensi_dasar').notNullable()
      table.integer('kompetensi_dasar_index').notNullable()
      table.integer('pertemuan').notNullable()
      table.string('materi')
      table.string('metode')
      table.boolean('kategori1')
      table.boolean('kategori2')
      table.boolean('kategori3')
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
