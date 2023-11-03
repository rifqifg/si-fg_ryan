import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'finance.revenues'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.float('current_balance')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('current_balance')
    })
  }
}
