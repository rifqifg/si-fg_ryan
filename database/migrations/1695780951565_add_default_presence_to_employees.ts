import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'employees'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('default_presence').nullable()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('default_presence')
    })
  }
}
