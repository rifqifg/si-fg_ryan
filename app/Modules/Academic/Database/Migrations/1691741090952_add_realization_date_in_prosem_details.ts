import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'academic.teacher_attendances'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('program_semester_detail_id').references('id').inTable('academic.program_semester_details').onDelete('no action').onUpdate('cascade').nullable()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('program_semester_detail_id')
    })
  }
}
