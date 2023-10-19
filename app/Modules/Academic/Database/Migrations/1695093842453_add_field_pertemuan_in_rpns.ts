import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'academic.rencana_pengambilan_nilais'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('pertemuan')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
    table.dropColumn('pertemuan')
    })
  }
}
