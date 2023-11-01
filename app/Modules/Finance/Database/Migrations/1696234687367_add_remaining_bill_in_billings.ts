import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'finance.billings'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.float('remaining_amount')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('remaining_amount')
    })
  }
}
