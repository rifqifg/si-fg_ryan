import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'academic.classes'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('kelas_jurusan').references('kode').inTable('academic.jurusans')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('kelas_jurusan')
    })
  }
}
