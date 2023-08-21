import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sub_activities'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').unique().notNullable().primary()
      table.string('name').notNullable()
      table.specificType('images', 'varchar[]').nullable()
      table.dateTime('date')
      table.string('note').nullable()
      table.uuid('activity_id').references('activities.id').onUpdate('cascade').onDelete('restrict')

      // activity_id uuid [ref: > activities.id]
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
