import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'leaves'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('leave_status')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('leave_status')
    })
  }
}
