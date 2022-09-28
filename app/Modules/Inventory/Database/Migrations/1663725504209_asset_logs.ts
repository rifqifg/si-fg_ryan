import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'asset_logs'

  public async up() {
    this.schema
      .withSchema('inventory')
      .createTable(this.tableName, (table) => {
        table.increments('id')
        table.uuid('asset_id').references('id').inTable('inventory.assets').onDelete('restrict').onUpdate('cascade')
        table.string('asset_log_type_id').references('id').inTable('inventory.asset_log_types').onDelete('restrict').onUpdate('cascade')
        table.uuid('student_id').references('id').inTable('academic.students').onDelete('restrict').onUpdate('cascade')
        table.uuid('employee_id').references('id').inTable('public.employees').onDelete('restrict').onUpdate('cascade')
        table.datetime('start_date', { useTz: false }).notNullable()
        table.datetime('end_date', { useTz: false }).defaultTo(null)
        table.string('notes')
        /**
         * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
         */
        table.timestamp('created_at', { useTz: true })
        table.timestamp('updated_at', { useTz: true })
      })
  }

  public async down() {
    this.schema
      .withSchema('inventory')
      .dropTable(this.tableName)
  }
}
