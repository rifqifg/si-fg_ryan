import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { TransactionMethods, TransactionStatus, TransactionTypes } from '../../lib/enums'

export default class extends BaseSchema {
  protected tableName = 'transactions'

  public async up() {
    this.schema
      .withSchema('finance')
      .createTable(this.tableName, (table) => {
        table.uuid('id').primary().notNullable().unique()
        table.string('coa_id').references('id').inTable('finance.coas').onDelete('set null').onUpdate('cascade')
        table.uuid('billing_id').references('id').inTable('finance.billings').onDelete('set null').onUpdate('cascade')
        table.uuid('document_id').references('id').inTable('finance.transaction_documents').onDelete('set null').onUpdate('cascade')
        // table.uuid('account_id').references('id').inTable('finance.accounts').onDelete('set null').onUpdate('cascade')
        table.uuid('teller_id').references('id').inTable('public.employees').onDelete('set null').onUpdate('cascade')
        table.string('amount').notNullable()
        table.enum('method', Object.values(TransactionMethods))
        // table.dateTime('date')
        table.enum('type', Object.values(TransactionTypes))
        table.enum('status', Object.values(TransactionStatus)).defaultTo(TransactionStatus.WAITING)
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
      .withSchema('finance')
      .dropTable(this.tableName)
  }
}
