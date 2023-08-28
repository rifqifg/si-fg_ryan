import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'presences'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('sub_activity_id').references('id').inTable('sub_activities').onDelete('no action')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('sub_activity_id')
    })
  }
}
