import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'entrance_exam_schedules'

  public async up() {
    this.schema
      .withSchema('ppdb')
      .createTable(this.tableName, (table) => {
        table.uuid('id').primary().notNullable().unique()
        table.uuid('batch_id').references('id').inTable('ppdb.ppdb_batches').onDelete('no action').onUpdate('cascade').notNullable()
        table.integer('max_capacity').notNullable()
        table.integer('current_quota').notNullable().defaultTo(0)
        table.timestamp('time_start').notNullable()
        table.timestamp('time_end').notNullable()

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
