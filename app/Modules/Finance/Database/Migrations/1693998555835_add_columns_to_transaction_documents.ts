import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'finance.transaction_documents'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('file').notNullable().alter()
      table.string('description')
      table.float('amount')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('file').nullable().alter()
      table.dropColumns('description', 'amount')
    })
  }
}
