import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'academic.daily_attendances'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('class_id')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('class_id').references('id').inTable('academic.classes').onDelete('cascade').onUpdate('cascade')
    })
  }
}
