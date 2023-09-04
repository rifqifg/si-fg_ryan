import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { TransactionStatus } from '../../lib/enums'

export default class extends BaseSchema {
  protected tableName = 'transaction_documents'

  public async up() {
    this.schema
      .withSchema('finance')
      .createTable(this.tableName, (table) => {
        table.uuid('id').primary().notNullable().unique()
        table.uuid('student_id').references('id').inTable('academic.students').onDelete('set null').onUpdate('cascade')
        table.string('file').notNullable()
        table.string('description')
        table.enum('status', Object.values(TransactionStatus)).defaultTo(TransactionStatus.WAITING)

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
