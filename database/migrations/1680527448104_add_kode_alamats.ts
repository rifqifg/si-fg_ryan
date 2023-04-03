import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'employees'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('kode_provinsi', 25)
      table.string('kode_kota', 25)
      table.string('kode_kecamatan', 25)
      table.string('kode_kelurahan', 25)
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('kode_provinsi', 'kode_kota', 'kode_kecamatan', 'kode_kelurahan')
    })
  }
}
