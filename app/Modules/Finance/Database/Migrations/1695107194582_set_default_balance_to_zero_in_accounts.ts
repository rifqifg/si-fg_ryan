import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'finance.accounts'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.float('balance').notNullable().defaultTo(0).alter()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.float('balance').notNullable().alter()
    })
  }
}
