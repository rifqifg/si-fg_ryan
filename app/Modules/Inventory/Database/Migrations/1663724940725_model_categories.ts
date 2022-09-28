import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'model_categories'

  public async up() {
    this.schema
      .withSchema('inventory')
      .createTable(this.tableName, (table) => {
        table.increments('id')
        table.string('name', 75).notNullable()
        table.string('type', 50).comment('model type')
        table.string('eula')
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
