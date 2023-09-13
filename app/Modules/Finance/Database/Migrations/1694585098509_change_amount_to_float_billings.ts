import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'finance.billings'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.float('amount').notNullable().alter()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('amount').notNullable().alter()
    })
  }
}
