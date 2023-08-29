import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'academic.program_semesters'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('class_id').references('id').inTable('academic.classes').onDelete('no action').onUpdate('cascade')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('class_id')
    })
  }
}
