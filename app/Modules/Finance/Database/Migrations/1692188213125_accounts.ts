import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'accounts'

  public async up() {
    this.schema
      .withSchema('finance')
      .createTable(this.tableName, (table) => {
        table.uuid('id').primary().notNullable().unique()
        table.string('coa_id').references('id').inTable('finance.coas').onDelete('set null').onUpdate('cascade')
        table.uuid('student_id').references('id').inTable('academic.students').onDelete('set null').onUpdate('cascade')
        table.uuid('employee_id').references('id').inTable('public.employees').onDelete('set null').onUpdate('cascade')
        table.string('owner')
        table.string('account_name').notNullable()
        table.string('balance').notNullable()
        table.string('number').notNullable().unique()

        /**
         * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
         */
        table.timestamp('created_at', { useTz: true })
        table.timestamp('updated_at', { useTz: true })
      })
  }

  public async down() {
    this.schema
      .withSchema('finance')
      .dropTable(this.tableName)
  }
}
