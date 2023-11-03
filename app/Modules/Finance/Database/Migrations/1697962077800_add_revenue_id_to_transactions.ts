import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'finance.transactions'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('revenue_id').nullable().references('id').inTable('finance.revenues').onDelete('set null').onUpdate('cascade')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('revenue_id')
    })
  }
}
