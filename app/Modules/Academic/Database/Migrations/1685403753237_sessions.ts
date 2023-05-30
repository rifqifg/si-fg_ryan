import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sessions'

  public async up () {
    this.schema
    .withSchema('academic')
    .createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique()
      table.string('session').notNullable()
      table.time('time_in').notNullable()
      table.time('time_out').notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema
    .withSchema('academic')
    .dropTable(this.tableName)
  }
}
