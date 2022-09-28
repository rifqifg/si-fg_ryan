import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'manufacturers'

  public async up() {
    this.schema
      .withSchema('inventory')
      .createTable(this.tableName, (table) => {
        table.uuid('id').notNullable().primary().unique()
        table.string('name', 75).notNullable()
        table.string('url', 75)
        table.string('support_phone', 25)
        table.string('support_email', 50)
        table.string('image')

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
