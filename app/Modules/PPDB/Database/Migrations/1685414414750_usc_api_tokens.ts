import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ApiTokens extends BaseSchema {
  protected tableName = 'usc_api_tokens'

  public async up() {
    this.schema
      .withSchema('ppdb')
      .createTable(this.tableName, (table) => {
        table.increments('id').primary()
        table.uuid('candidate_id').references('id').inTable('ppdb.user_student_candidates').onDelete('cascade').onUpdate('cascade')
        table.string('name').notNullable()
        table.string('type').notNullable()
        table.string('token', 64).notNullable().unique()

        /**
         * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
         */
        table.timestamp('expires_at', { useTz: true }).nullable()
        table.timestamp('created_at', { useTz: true }).notNullable()
      })
  }

  public async down() {
    this.schema
      .withSchema('ppdb')
      .dropTable(this.tableName)
  }
}
