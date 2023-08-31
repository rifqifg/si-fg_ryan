import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'agendas'

  public async up () {
    this.schema.withSchema('academic').createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().notNullable()
      table.string('name').notNullable()
      table.boolean('count_presence').defaultTo(false)
      table.string('description').nullable()
      table.date('date').notNullable()
      table.enum('type', ['NATIONAL_DAY', 'HOLIDAY', 'EVENT', 'SCHOOL_AGENDA'])
      table.uuid('user_id').references('id').inTable('users').onDelete('set null')
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