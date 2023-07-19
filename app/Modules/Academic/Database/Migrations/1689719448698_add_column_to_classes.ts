import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'classes'

  public async up () {
    this.schema
    .withSchema('academic')
    .alterTable(this.tableName, (table) => {
      table.boolean('is_graduated').defaultTo(false)
    })
  }

  public async down () {
    this.schema
    .withSchema('academic')
    .alterTable(this.tableName, (table) => { 
      table.dropColumns('is_graduated')
    })
  }
}
