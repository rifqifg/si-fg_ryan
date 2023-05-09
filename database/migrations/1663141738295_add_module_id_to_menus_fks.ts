import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'menus'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.foreign('module_id', 'menus_module_id_foreign').references('id').inTable('modules').onDelete('no action').onUpdate('cascade')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('module_id', 'menus_module_id_foreign')
    })
  }
}
