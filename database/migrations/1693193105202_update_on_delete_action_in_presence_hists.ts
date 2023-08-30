import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'presence_hists'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('presence_id')
      table.setNullable('presence_id')
      table.foreign('presence_id').references('id').inTable('presences').onDelete('set null')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('presence_id')
      table.dropNullable('presence_id')
      table.foreign('presence_id').references('id').inTable('presences').onDelete('no action')
    })
  }
}
