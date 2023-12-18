import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { BillingStatus } from '../../lib/enums'

export default class extends BaseSchema {
  protected tableName = 'finance.billings'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.float('remaining_amount')
      table.enum('status', Object.values(BillingStatus))
      table.string('due_note')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('remaining_amount', 'status', 'due_note')
    })
  }
}
