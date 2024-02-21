import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'foundations'
  protected schemaName = 'foundation'

  public async up() {
    this.schema.withSchema(this.schemaName).createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().notNullable()
      table.string('name').notNullable()
      table.string('description').nullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })

    //create first data
    this.schema.raw(`
      INSERT INTO foundation.foundations
      (id, name, description, created_at, updated_at)
      VALUES
      ('c1d3e93b-1774-4682-9a81-c1915742c8e2', 'FG Putra', 'SMA FG', now(), now())
    `)
  }

  public async down() {
    this.schema.withSchema(this.schemaName).dropTable(this.tableName)
  }
}
