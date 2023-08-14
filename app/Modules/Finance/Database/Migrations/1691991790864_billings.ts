import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { BillingStatus, BillingType } from '../../lib/enums'

export default class extends BaseSchema {
  protected tableName = 'billings'

  public async up() {
    this.schema
      .withSchema('finance')
      .createTable(this.tableName, (table) => {
        table.uuid('id').primary().notNullable().unique()
        table.uuid('student_id').references('id').inTable('academic.students').onDelete('no action').onUpdate('cascade')
        table.uuid('master_billing_id').references('id').inTable('finance.master_billings').onDelete('no action').onUpdate('cascade')
        table.string('name').notNullable()
        table.string('amount').notNullable()
        table.string('description')
        table.enum('status', Object.values(BillingStatus)).notNullable()
        table.enum('type', Object.values(BillingType)).notNullable()

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
