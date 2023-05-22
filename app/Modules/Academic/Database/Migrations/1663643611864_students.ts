import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'students'

  public async up() {
    this.schema
      .withSchema('academic')
      .createTable(this.tableName, (table) => {
        table.uuid('id').primary().notNullable().unique()
        table.uuid('class_id').references('id').inTable('academic.classes').onDelete('no action').onUpdate('cascade')
        table.string('nik').notNullable()
        table.string('name').notNullable()
        table.string('nis')
        table.string('nisn')
        table.string('birth_city')
        table.date('birth_day')
        table.string('religion')
        table.string('address')
        table.string('rt')
        table.string('rw')
        table.string('desa')
        table.string('kel')
        table.string('kec')
        table.string('kot')
        table.string('prov')
        table.string('zip')
        table.string('phone')
        table.string('mobile_phone')
        table.string('email')

        /**
         * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
         */
        table.timestamp('created_at', { useTz: true })
        table.timestamp('updated_at', { useTz: true })
      })
  }

  public async down() {
    this.schema
      .withSchema('academic')
      .dropTable(this.tableName)
  }
}
