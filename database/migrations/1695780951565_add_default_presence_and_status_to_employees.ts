import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'employees'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('default_presence').nullable()
      table.enum('status', ['FULL_TIME', 'PART_TIME'])
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('default_presence', 'status')
    })
  }
}
