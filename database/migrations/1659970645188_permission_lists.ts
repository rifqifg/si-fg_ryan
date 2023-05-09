import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'permission_lists'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('role_id').references('name').inTable('roles').onDelete('no action')
      table.string('id')
      table.enum('type', ['show', 'disable'])

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
