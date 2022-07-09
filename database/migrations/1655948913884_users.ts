import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UsersSchema extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable()
      table.string('name').notNullable()
      table.string('email', 255).notNullable()
      table.string('role', 45).references('name').inTable('roles').onDelete('no action')
      table.string('rfid')
      table.uuid('employee_id').references('id').inTable('employees').onDelete('no action')
      table.string('password', 180).notNullable()
      table.string('remember_me_token').nullable()
      table.boolean('verified').defaultTo(false)
      table.string('verify_token').defaultTo(null)
      table.datetime('verify_expiry')

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
      table.timestamp('deleted_at', { useTz: true }).nullable()

    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
