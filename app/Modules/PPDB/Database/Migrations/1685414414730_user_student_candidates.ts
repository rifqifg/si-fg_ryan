import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'user_student_candidates'

  public async up() {
    this.schema
      .withSchema('ppdb')
      .createTable(this.tableName, (table) => {
        table.uuid('id').primary().notNullable()
        table.string('nisn', 15).unique().notNullable()
        table.string('email').unique().notNullable()
        table.string('password', 180).notNullable()
        table.string('verify_token').defaultTo(null)
        table.datetime('verify_expiry')
        table.boolean('verified').defaultTo(false)
        table.string('remember_me_token').nullable()

        /**
         * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
         */
        table.timestamp('created_at', { useTz: true })
        table.timestamp('updated_at', { useTz: true })
      })
  }

  public async down() {
    this.schema
      .withSchema('ppdb')
      .dropTable(this.tableName)
  }
}
