import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'leave_sessions'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('sessions');
      table.time('from_time')
      table.time('to_time')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.specificType('sessions', 'varchar[]')
      table.dropColumns('from_time', 'to_time')
    })
  }
}
