import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'academic.students'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('desa')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('desa')
    })
  }
}
