import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.foreign('role', 'users_role_foreign')
        .references('name')
        .inTable('roles')
        .onUpdate('cascade')
        .onDelete('no action')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('role', 'users_role_foreign')
    })
  }
}
