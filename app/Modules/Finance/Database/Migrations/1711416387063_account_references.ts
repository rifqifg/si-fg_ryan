import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'account_references'

  public async up () {
    this.schema
      .withSchema('finance')
      .createTable(this.tableName, (table) => {
        table.uuid('id').primary().notNullable().unique()
        table.uuid('account_id').notNullable().references('id').inTable('finance.accounts').onDelete('cascade').onUpdate('cascade')
        table.string('type')
        table.float('amount').notNullable()

        /**
         * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
         */
        table.timestamp('created_at', { useTz: true })
        table.timestamp('updated_at', { useTz: true })
      })
  }

  public async down () {
    this.schema
      .withSchema('finance')
      .dropTable(this.tableName)
  }
}
