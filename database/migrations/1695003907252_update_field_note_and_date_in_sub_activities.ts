import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sub_activities'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('date', 'note', 'time')
    })
    this.schema.alterTable(this.tableName, (table) => {
      table.dateTime('date')
      table.jsonb('note')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns( 'date', 'note')
    })
    this.schema.alterTable(this.tableName, (table) => {
      table.date('date')
      table.time('time')
      table.text('note')
    })
  }
}
