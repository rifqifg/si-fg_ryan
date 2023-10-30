import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'monthly_report_employees'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').unique().notNullable().primary()
      table.text('achievement').nullable()
      table.text('indisipliner').nullable()
      table.text('suggestions_and_improvements').nullable()
      table.uuid('employee_id').references('employees.id').onUpdate('cascade').onDelete('cascade')
      table.uuid('monthly_report_id').references('monthly_reports.id').onUpdate('cascade').onDelete('cascade')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
