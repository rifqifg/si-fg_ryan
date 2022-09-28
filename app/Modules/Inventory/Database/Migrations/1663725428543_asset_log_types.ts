import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'asset_log_types'

  public async up() {
    this.schema
      .withSchema('inventory')
      .createTable(this.tableName, (table) => {
        table.string('id', 25).notNullable().primary().unique()
        table.string('description', 100)

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
