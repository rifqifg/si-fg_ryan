import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'academic.student_hists'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('nik').nullable().alter()

    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('nik').notNullable().alter()
    })
  }
}
