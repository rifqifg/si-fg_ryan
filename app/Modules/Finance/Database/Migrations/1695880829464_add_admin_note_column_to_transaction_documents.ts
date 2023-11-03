import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'finance.transaction_documents'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('admin_note')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('admin_note')
    })
  }
}
