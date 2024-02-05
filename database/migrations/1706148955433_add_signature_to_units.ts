import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'units'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('signature')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('signature')
    })
  }
}
