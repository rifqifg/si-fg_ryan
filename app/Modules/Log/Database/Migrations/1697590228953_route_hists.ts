import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'route_hists'

  public async up() {
    this.schema.withSchema('log').createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().notNullable()
      table.string('method')
      table.jsonb('body')
      table.string('route')
      table.enum('status', ['START', 'FINISH', 'ERROR'])
      table.string('activity')
      table.text('message')
      table.jsonb('params')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.withSchema('log').dropTable(this.tableName)
  }
}
