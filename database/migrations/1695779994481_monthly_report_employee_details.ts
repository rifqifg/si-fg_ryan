import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'monthly_report_employee_details'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').unique().notNullable().primary()
      table.integer('skor').nullable()
      table.string('note').nullable()
      table.uuid('monthly_report_employee_id').references('monthly_report_employees.id').onUpdate('cascade').onDelete('restrict')
      table.uuid('leave_id').references('leaves.id').onUpdate('cascade').onDelete('restrict').nullable()
      table.uuid('activity_id').references('activities.id').onUpdate('cascade').onDelete('restrict').nullable()


      // activity_id uuid [ref: <> activities.id]
      // leave_id uuid [ref: <> leaves.id]
      // monthly_report_employee_id uuid [ref: <> monthly_report_employees.id]
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
