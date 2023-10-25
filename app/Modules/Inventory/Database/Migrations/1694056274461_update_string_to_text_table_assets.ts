import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'assets'

  public async up() {
    this.schema.withSchema('inventory').alterTable(this.tableName, (table) => {
      table.text('notes').alter()
      table.text('tag').alter()
    })
  }

  public async down() {
    this.schema.withSchema('inventory').alterTable(this.tableName, (table) => {
      table.string('notes', 100).alter()
      table.string('tag', 50).alter()
    })
  }
}
