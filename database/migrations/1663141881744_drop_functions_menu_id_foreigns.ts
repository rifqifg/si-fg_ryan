import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'functions'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('menu_id', 'functions_menu_id_foreign')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.foreign('menu_id', 'functions_menu_id_foreign')
        .references('id')
        .inTable('menus')
        .onDelete('no action')
    })
  }
}
