import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'models'

  public async up() {
    this.schema
      .withSchema('inventory')
      .createTable(this.tableName, (table) => {
        table.uuid('id').notNullable().primary().unique()
        table.string('name', 100).notNullable()
        table.string('number', 75).comment('model number')
        table.integer('model_category_id').unsigned().references('id').inTable('inventory.model_categories').onDelete('set null').onUpdate('cascade')
        table.uuid('manufacturer_id').references('id').inTable('inventory.manufacturers').onDelete('set null').onUpdate('cascade')
        table.integer('eol').comment('end of life, satuan month')
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
