import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'finance.revenues'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('invoice_number')
      table.float('invoice_amount')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('invoice_number', 'invoice_amount')
    })
  }
}
