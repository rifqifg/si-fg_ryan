import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('student_id').references('id').inTable('academic.students').onDelete('set null').onUpdate('cascade')
      table.uuid('student_parent_id').references('id').inTable('academic.student_parents').onDelete('set null').onUpdate('cascade')
      
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('student_id')
      table.dropColumn('student_parent_id')
    })
  }
}
