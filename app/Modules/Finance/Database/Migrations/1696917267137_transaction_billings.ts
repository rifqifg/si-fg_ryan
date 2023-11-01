import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'transaction_billings'

  public async up() {
    this.schema
      .withSchema('finance')
      .createTable(this.tableName, (table) => {
        table.uuid('transaction_id').references('id').inTable('finance.transactions').onDelete('set null').onUpdate('cascade')
        table.uuid('billing_id').references('id').inTable('finance.billings').onDelete('set null').onUpdate('cascade')
        table.float('amount').notNullable()
        table.unique(['transaction_id', 'billing_id'])
        /**
         * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
         */
        table.timestamp('created_at', { useTz: true })
        table.timestamp('updated_at', { useTz: true })
      })
  }

  public async down() {
    this.schema
      .withSchema('finance')
      .dropTable(this.tableName)
  }
}
