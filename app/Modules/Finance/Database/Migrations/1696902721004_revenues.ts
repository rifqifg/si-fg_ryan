import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { RevenueStatus } from '../../lib/enums'

export default class extends BaseSchema {
  protected tableName = 'revenues'

  public async up() {
    this.schema
      .withSchema('finance')
      .createTable(this.tableName, (table) => {
        table.uuid('id').primary().notNullable().unique()
        table.uuid('from_account').notNullable().references('id').inTable('finance.accounts').onDelete('set null').onUpdate('cascade')
        table.float('amount').notNullable()
        table.timestamp('time_received').notNullable()
        table.enum('status', Object.values(RevenueStatus)).notNullable()

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
