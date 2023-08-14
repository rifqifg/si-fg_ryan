import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { BillingPeriod, BillingType } from '../../lib/enums'

export default class extends BaseSchema {
  protected tableName = 'master_billings'

  public async up() {
    this.schema
      .withSchema('finance')
      .createTable(this.tableName, (table) => {
        table.uuid('id').primary().notNullable().unique()
        table.string('name').notNullable()
        table.enum('period', Object.values(BillingPeriod)).notNullable()
        table.string('amount').notNullable()
        table.enum('type', Object.values(BillingType)).notNullable()
        table.timestamp('due_date').notNullable()
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
