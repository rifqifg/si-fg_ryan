import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'asset_loan_batches'

  public async up() {
    this.schema
      .withSchema('inventory')
      .alterTable(this.tableName, (table) => {
        table.datetime('start_date', { useTz: false }).notNullable()
        table.datetime('end_date', { useTz: false })
      })
  }

  public async down() {
    this.schema
      .withSchema('inventory')
      .alterTable(this.tableName, (table) => {
        table.dropColumns('start_date', 'end_date')
      })
  }
}
