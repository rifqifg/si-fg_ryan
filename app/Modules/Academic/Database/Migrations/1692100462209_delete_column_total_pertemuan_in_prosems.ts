import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'academic.program_semesters'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
    table.dropColumn('total_pertemuan')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
    table.integer('total_pertemuan').notNullable()
    })
  }
}
