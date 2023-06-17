import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'students'

  public async up() {
    this.schema
      .withSchema('academic')
      .alterTable(this.tableName, (table) => {
        table.uuid('class_id').alter().notNullable().primary()
        table.string('nik', 16).alter().unique().notNullable()
      })
  }

  public async down() {
    this.schema
      .withSchema('academic')
      .alterTable(this.tableName, (table) => {
        // table.string('nik', 16).notNullable()
        table.dropUnique(['nik'])
      })
  }
}
