import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'academic.students'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('student_status', ['AKTIF', 'MUTASI', 'MENGUNDURKAN DIRI', 'LAINNYA', 'DIKELUARKAN', 'WAFAT'])
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('student_status')
    })
  }
}
