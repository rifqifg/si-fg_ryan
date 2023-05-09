import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'employees'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('rfid').after('date_out')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('rfid')
    })
  }
}
