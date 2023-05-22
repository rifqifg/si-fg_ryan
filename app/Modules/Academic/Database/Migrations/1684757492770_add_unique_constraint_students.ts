import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'students'

  public async up() {
    this.schema
      .withSchema('academic')
      .alterTable(this.tableName, (table) => {
        table.string('nik', 16).alter().unique()
      })
  }

  public async down() {
    this.schema
      .withSchema('academic')
      .alterTable(this.tableName, (table) => {
        table.string('nik', 16).notNullable()
      })
  }
}
