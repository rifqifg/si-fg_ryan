import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { BillingType } from '../../lib/enums'

export default class extends BaseSchema {
  protected tableName = 'finance.accounts'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropChecks('accounts_type_check') // finding this one is PITA
      table.string('type').alter()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('type')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.enum('type', Object.values(BillingType))
    })
  }
}
