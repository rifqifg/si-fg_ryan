import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'activity_members'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').unique().notNullable().primary()
      table.enum('role', ['manager', 'member'])
      table.uuid('activity_id').references('activities.id').onUpdate('cascade').onDelete('cascade')
      table.uuid('employee_id').references('employees.id').onUpdate('cascade').onDelete('cascade')

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
