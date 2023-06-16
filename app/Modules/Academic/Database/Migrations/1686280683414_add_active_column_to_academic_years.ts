import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'academic.academic_years'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('active').defaultTo(false)
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('active')
    })
  }
}
