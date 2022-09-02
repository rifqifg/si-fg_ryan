import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'manufacturers'

  public async up() {
    this.schema.withSchema('inventory')
      .createTable(this.tableName, (table) => {
        table.uuid('id').notNullable().primary()
        table.string('name').notNullable()


        /**
         * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
         */
        table.timestamp('created_at', { useTz: true })
        table.timestamp('updated_at', { useTz: true })
      })
  }

  public async down() {
    this.schema.withSchema('inventory').dropTable(this.tableName)
  }
}
