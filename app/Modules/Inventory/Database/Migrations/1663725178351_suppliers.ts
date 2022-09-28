import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'suppliers'

  public async up() {
    this.schema
      .withSchema('inventory')
      .createTable(this.tableName, (table) => {
        table.uuid('id').notNullable().primary().unique()
        table.string('name', 75).notNullable()
        table.string('address')
        table.string('city', 50)
        table.string('state', 50)
        table.string('country', 50)
        table.string('zipcode', 15)
        table.string('contact_name', 75)
        table.string('phone', 20)
        table.string('fax', 20)
        table.string('email', 50)
        table.string('url', 100)
        table.string('notes', 100)
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
