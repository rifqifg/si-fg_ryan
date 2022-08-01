import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'activities'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('type', ['scheduled', 'standalone']).defaultTo('standalone')
      table.string('days').comment('diisi array hari 1-7 , contoh [1,3,7] senin rabu minggu')
      table.boolean('schedule_active').defaultTo(false).comment('kalau aktif, di validasi, kalau tidak aktif, skip validasi')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('type', 'days', 'schedule_active')
    })
  }
}
