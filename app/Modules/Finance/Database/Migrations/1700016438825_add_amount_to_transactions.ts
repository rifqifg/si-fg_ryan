import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'finance.transactions'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.float('amount')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('amount')
    })
  }
}
