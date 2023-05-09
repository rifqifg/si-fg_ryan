import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'asset_locations'

  public async up() {
    this.schema
      .withSchema('inventory')
      .createTable(this.tableName, (table) => {
        table.uuid('id').notNullable().primary().unique()
        table.uuid('parent').comment('untuk sub location, self join')
        table.uuid('employee_id').references('id').inTable('public.employees').onDelete('set null').onUpdate('cascade')
        table.string('address')
        table.string('city', 50)
        table.string('state', 50)
        table.string('country', 50)
        table.string('zipcode', 15)
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
