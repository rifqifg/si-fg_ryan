import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'triwulan_employees'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.specificType('direct_supervisor', 'uuid[]').nullable()
      table.uuid('indirect_supervisor').references('divisions.id').onUpdate('cascade').onDelete('cascade')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('direct_supervisor', 'indirect_supervisor')
    })
  }
}
