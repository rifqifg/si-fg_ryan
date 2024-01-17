import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'activities'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('division_id')
      table.uuid('unit_id').references('id').inTable('units').onDelete('no action')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('unit_id')
      table.uuid('division_id').references('id').inTable('divisions').onDelete('no action')
    })
  }
}
