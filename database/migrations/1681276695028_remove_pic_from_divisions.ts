import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'divisions'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('pic')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('pic').comment('penanggung jawab divisi, berisi employee_id')
    })
  }
}
