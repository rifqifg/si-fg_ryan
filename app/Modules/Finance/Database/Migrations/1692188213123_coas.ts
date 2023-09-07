import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { CoaTypes } from '../../lib/enums'

export default class extends BaseSchema {
  protected tableName = 'coas'

  public async up() {
    this.schema
      .withSchema('finance')
      .createTable(this.tableName, (table) => {
        table.string('id').primary().notNullable().unique()
        table.string('parent_coa_id').references('id').inTable('finance.coas').onDelete('no action').onUpdate('cascade')
        table.string('name').notNullable()
        table.enum('type', Object.values(CoaTypes)).notNullable()

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
