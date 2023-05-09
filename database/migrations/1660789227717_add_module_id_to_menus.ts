import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'menus'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('module_id').references('id').inTable('modules').onDelete('no action')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('module_id')
    })
  }
}
