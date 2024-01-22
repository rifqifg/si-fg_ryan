import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'add_image_on_leaves'

  public async up () {
    this.schema.alterTable('leaves', (table) => {
      table.string('image')
    })
    this.schema.alterTable('leave_sessions', (table) => {
      table.string('image')
    })
  }

  public async down () {
    this.schema.alterTable('leaves', (table) => {
      table.dropColumns('image')
    })
    this.schema.alterTable('leave_sessions', (table) => {
      table.dropColumns('image')
    })
  }
}
