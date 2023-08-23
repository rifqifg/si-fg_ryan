import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'presences'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('client_user_id').references('id').inTable('users').onDelete('no action')
      table.string('client_ip')
      table.string('client_hostname')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('client_user_id', 'client_ip', 'client_hostname')
    })
  }
}
