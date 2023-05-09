import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'activities'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.time('time_late_start').nullable().after('time_in_start')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('time_late_start')
    })
  }
}
