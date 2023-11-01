import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { BillingStatus } from '../../lib/enums'

export default class extends BaseSchema {
  protected tableName = 'finance.billings'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('status')
      table.boolean('approved')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('approved')
      table.enum('status', Object.values(BillingStatus)).notNullable().defaultTo(BillingStatus.UNPAID)
    })
  }
}
