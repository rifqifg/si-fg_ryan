import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'academic_years'

  public async up() {
    this.schema
      .withSchema('academic')
      .createTable(this.tableName, (table) => {
        table.increments('id')
        table.string('year').notNullable()
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
      .withSchema('academic')
      .dropTable(this.tableName)
  }
}
