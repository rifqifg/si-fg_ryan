import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'students'

  public async up () {
    this.schema
    .withSchema('academic')
    .alterTable(this.tableName, (table) => {
        table.uuid('class_id').nullable().alter()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('class_id').notNullable().alter()
    })
  }
}
