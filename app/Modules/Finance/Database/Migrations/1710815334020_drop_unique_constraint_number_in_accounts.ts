import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'finance.accounts'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['number'], 'accounts_number_unique')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.unique(['number'], { indexName: 'accounts_number_unique' })
    })
  }
}
