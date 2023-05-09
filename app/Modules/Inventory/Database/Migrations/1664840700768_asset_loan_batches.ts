import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'asset_loan_batches'

  public async up() {
    this.schema
      .withSchema('inventory')
      .createTable(this.tableName, (table) => {
        table.uuid('id').notNullable().primary()
        table.uuid('employee_id').references('id').inTable('employees').onDelete('restrict').onUpdate('cascade').comment('pic batch nya, karyawan / guru')
        table.enum('type', ['TEACH', 'WORK', 'PERSONAL', 'EVENT']).notNullable()
        table.string('description').comment('tujuannya apa / kelas apa / pelajaran apa')
        /**
         * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
         */
        table.timestamp('created_at', { useTz: true })
        table.timestamp('updated_at', { useTz: true })
      })
  }

  public async down() {
    this.schema
      .withSchema('inventory')
      .dropTable(this.tableName)
  }
}
