import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'activities'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('owner').references('id').inTable('users').onDelete('no action')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('owner')
    })
  }
}
