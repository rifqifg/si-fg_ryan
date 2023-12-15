import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'finance.transactions'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('account_id').references('id').inTable('finance.accounts').onDelete('set null').onUpdate('cascade')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('account_id')
    })
  }
}
