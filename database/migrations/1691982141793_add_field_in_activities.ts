import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'activities'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('assessment').defaultTo(true)
      table.integer('default').nullable()
      table.enum('activity_type', ['fixed_time', 'not_fixed_time'])
      table.uuid('category_activity_id').references('category_activities.id').onUpdate('cascade').onDelete('restrict')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('assessment', 'default', 'activity_type', 'category_activity_id')
    })
  }
}
