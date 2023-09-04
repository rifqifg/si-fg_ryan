import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'presence_hists'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('activity_id')
      table.setNullable('activity_id')
      table.foreign('activity_id').references('id').inTable('activities').onDelete('set null')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('activity_id')
      table.dropNullable('activity_id')
      table.foreign('activity_id').references('id').inTable('activities').onDelete('no action')
    })
  }
}
