import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'route_hists'

  public async up () {
    this.schema.withSchema('log').alterTable(this.tableName, (table) => {
      table.uuid('user_id').nullable()
      table.integer('duration')
    })
  }

  public async down () {
    this.schema.withSchema('log').alterTable(this.tableName, (table) => {
      table.dropColumns('user_id', 'duration')
    })
  }
}
