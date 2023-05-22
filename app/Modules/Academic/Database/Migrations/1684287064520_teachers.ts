import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'teachers'

  public async up () {
    this.schema
    .withSchema('academic')
    .createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique()
      table.uuid('employee_id').references('id').inTable('public.employees').onDelete('no action').onUpdate('cascade')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema
    .withSchema('academic')
    .dropTable(this.tableName)
  }
}
