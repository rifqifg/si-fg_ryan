import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'employees'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('status', 'division_id')
      table.string('nuptk', 50)
      table.string('employee_type_id', 20).references('employee_types.id').onDelete('cascade').onUpdate('cascade')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('status').comment('FULLTIME, PARTTIME, RESIGNED')
      table.uuid('division_id').references('id').inTable('divisions').onDelete('no action')
    })
  }
}
