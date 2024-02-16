import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'monthly_report_employee_details'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.time('total_leave_session').nullable()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('total_leave_session')
    })
  }
}
