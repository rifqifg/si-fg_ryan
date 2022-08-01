import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'activities'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('type', ['scheduled', 'standalone']).defaultTo('standalone')
      table.boolean('schedule_active').defaultTo(false).comment('kalau aktif, di validasi, kalau tidak aktif, skip validasi')
      table.string('days')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('type', 'schedule_active', 'days')
    })
  }
}
