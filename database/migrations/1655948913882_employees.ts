import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'employees'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').notNullable().primary()
      table.string('nip').comment('nomor induk pegawai')
      table.string('name').notNullable()
      table.string('birth_city').notNullable()
      table.date('birth_day').notNullable()
      table.enum('gender', ['L', 'P']).notNullable()
      table.string('address').notNullable()
      table.uuid('division_id').references('id').inTable('divisions')
      table.string('status').comment('FULLTIME, PARTTIME, RESIGNED')
      table.date('date_in').comment('tanggal masuk')
      table.date('date_out').comment('tanggal keluar').defaultTo(null)
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
