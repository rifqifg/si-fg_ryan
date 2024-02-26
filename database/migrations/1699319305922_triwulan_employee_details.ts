import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'triwulan_employee_details'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').notNullable().unique().primary()
      table.integer('skor')

      table.uuid('triwulan_employee_id').references('triwulan_employees.id').onUpdate('cascade').onDelete('cascade')
      table.uuid('assessment_component_id').references('assessment_components.id').onUpdate('cascade').onDelete('cascade')

      table.boolean('direct_supervisor')
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