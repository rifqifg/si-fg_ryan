import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'academic.teachings'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('buku_nilai_id').references('id').inTable('academics.buku_nilais').onDelete('set null').onUpdate('cascade')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('buku_nilai_id')
    })
  }
}
