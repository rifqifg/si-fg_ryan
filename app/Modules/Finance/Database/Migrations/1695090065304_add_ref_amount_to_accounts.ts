import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'finance.accounts'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.float('ref_amount')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('ref_amount')
    })
  }
}
