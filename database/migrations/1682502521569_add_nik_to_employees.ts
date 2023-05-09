import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'employees'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('nik', 16)
      table.string('last_education_name')
      table.string('last_education_major')
      table.date('last_education_graduate')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('nik', 'last_education_name', 'last_education_major', 'last_education_graduate')
    })
  }
}
