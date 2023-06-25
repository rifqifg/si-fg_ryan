import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'student_parents'

  public async up () {
    this.schema
    .withSchema('academic')
    .alterTable(this.tableName, (table) => {
      table.dropUnique(['student_id', 'nik'])
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.unique(['student_id', 'nik'])
    })
  }
}
