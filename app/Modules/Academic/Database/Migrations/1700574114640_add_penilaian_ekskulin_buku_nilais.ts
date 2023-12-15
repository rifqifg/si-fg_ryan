import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'academic.buku_nilais'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('nilai_ekskul')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('nilai_ekskul')
    })
  }
}
