import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'monthly_reports'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('unit_id').references('id').inTable('units').onDelete('no action')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('unit_id')
    })
  }
}
