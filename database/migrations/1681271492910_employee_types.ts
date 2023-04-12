import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'employee_types'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 25).notNullable().primary().comment('PNS/TKK/HM/GTY/GTT')
      table.string('name', 100)
      table.string('description')

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
