import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'finance.transactions'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('billing_id')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('billing_id').references('id').inTable('finance.billings').onDelete('set null').onUpdate('cascade')
    })
  }
}
