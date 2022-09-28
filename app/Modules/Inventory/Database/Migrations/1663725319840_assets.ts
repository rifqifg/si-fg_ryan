import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'assets'

  public async up() {
    this.schema
      .withSchema('inventory')
      .createTable(this.tableName, (table) => {
        table.uuid('id').notNullable().primary().unique()
        table.uuid('model_id').references('id').inTable('inventory.models').onDelete('set null').onUpdate('cascade')
        table.uuid('asset_location_id').references('id').inTable('inventory.asset_locations').onDelete('set null').onUpdate('cascade')
        table.uuid('supplier_id').references('id').inTable('inventory.suppliers').onDelete('set null').onUpdate('cascade')
        table.string('asset_status_id').references('id').inTable('inventory.asset_statuses').onDelete('set null').onUpdate('cascade')
        table.string('serial', 50)
        table.string('tag', 50)
        table.date('purchase_date')
        table.string('order_number', 50)
        table.float('price', 50)
        table.integer('warranty').comment('in month')
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
