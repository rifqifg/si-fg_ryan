import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'activities'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.time("max_working_duration").after('time_out_end')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('max_working_duration')
    })
  }
}
