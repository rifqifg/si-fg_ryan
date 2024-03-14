import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'classes'

  public async up () {
    this.schema.withSchema('academic').alterTable(this.tableName, (table) => {
      table.uuid('foundation_id').references('id').inTable('foundation.foundations').onDelete('no action')
    })

    //update semua foundation_id di table classes.
    this.schema.raw("update academic.classes set foundation_id = 'c1d3e93b-1774-4682-9a81-c1915742c8e2'")
  }

  public async down () {
    this.schema.withSchema('academic').alterTable(this.tableName, (table) => {
      table.dropColumn('foundation_id')
    })
  }
}
