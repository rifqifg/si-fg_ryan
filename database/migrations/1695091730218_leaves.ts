import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'leaves'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').unique().notNullable().primary()
      table.enum('status', ['aprove', 'rejected', 'waiting'])
      table.string('reason')
      table.date('date')
      table.text('note').nullable()
      table.enum('type', ['paid', 'unpaid'])
      table.uuid('employee_id').references('employees.id').onUpdate('cascade').onDelete('restrict')

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
