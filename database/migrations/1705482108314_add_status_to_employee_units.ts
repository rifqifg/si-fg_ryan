import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'employee_units'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('status')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('status')
    })
  }
}
