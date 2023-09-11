import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'user_roles'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('user_id').references('id').inTable('users').onDelete('cascade').notNullable()
      table.string('role_name').references('name').inTable('roles').onDelete('no action').notNullable()
      table.primary(['user_id', 'role_name'])

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })

    this.schema.raw(`
      INSERT INTO user_roles (user_id, role_name)
      SELECT id, role FROM users
    `)
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
