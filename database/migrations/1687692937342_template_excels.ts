import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'template_excels'

  public async up() {
    this.schema
      .createTable(this.tableName, (table) => {
        table.uuid('id').unique().notNullable().primary()
        table.string('name').notNullable()
        table.string('link').notNullable()
        table.string('description')

        /**
         * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
         */
        table.timestamp('created_at', { useTz: true })
        table.timestamp('updated_at', { useTz: true })
      })
  }

  public async down() {
    this.schema
    .dropTable(this.tableName)
  }
}
