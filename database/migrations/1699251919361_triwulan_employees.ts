import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'triwulan_employees'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').unique().primary().notNullable()
      table.text('other_achievements_worth_noting')
      table.text('specific_indiscipline_that_needs_to_be_noted')
      table.text('suggestions_and_improvements')

      table.uuid('employee_id').references('employees.id').onUpdate('cascade').onDelete('restrict')
      table.uuid('triwulan_id').references('triwulans.id').onUpdate('cascade').onDelete('cascade')
      table.specificType('direct_supervisor', 'uuid').references('employee_divisions.id').onUpdate('cascade').onDelete('cascade')
      table.uuid('indirect_supervisor').references('employee_divisions.id').onUpdate('cascade').onDelete('cascade')
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
