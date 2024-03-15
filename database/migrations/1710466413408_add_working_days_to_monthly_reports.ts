import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'monthly_reports'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('working_days')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('working_days')
    })
  }
}
