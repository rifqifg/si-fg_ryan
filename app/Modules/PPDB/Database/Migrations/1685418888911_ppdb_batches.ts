import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'ppdb_batches'

  public async up() {
    this.schema
      .withSchema('ppdb')
      .createTable(this.tableName, (table) => {
        table.uuid('id').primary().notNullable()
        table.string('name').notNullable()
        table.string('academic_year', 25).references('year').inTable('ppdb.academic_years').onDelete('no action').onUpdate('cascade').notNullable()
        table.string('description')
        table.boolean('active').defaultTo(false).notNullable()

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
