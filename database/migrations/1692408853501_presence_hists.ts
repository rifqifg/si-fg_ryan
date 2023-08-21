import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'presence_hists'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').notNullable().primary().defaultTo(this.raw("gen_random_uuid()"))
      table.uuid('presence_id').references('id').inTable('presences').notNullable().onDelete('no action')
      table.uuid('activity_id').references('id').inTable('activities').notNullable().onDelete('no action')
      table.uuid('employee_id').references('id').inTable('employees').notNullable().onDelete('no action')
      table.string('action_type').notNullable()
      table.datetime('time_in', { useTz: false })
      table.datetime('time_out', { useTz: false })
      table.string('description')
      table.uuid('server_user_id').references('id').inTable('users').onDelete('no action')
      table.string('server_ip')
      table.string('server_hostname')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).defaultTo(this.raw("now()"))
    })

    this.schema.raw(`
      ------ FUNCTIONS ------
      CREATE OR REPLACE FUNCTION log_presences_insert() RETURNS TRIGGER AS $$
      BEGIN
          INSERT INTO public.presence_hists (presence_id, activity_id, employee_id, action_type, time_in, time_out, description, server_user_id, server_ip, server_hostname)
          VALUES (new.id, NEW.activity_id, NEW.employee_id, 'INSERT', NEW.time_in, NEW.time_out, NEW.description, NEW.client_user_id, NEW.client_ip, NEW.client_hostname);
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      ------ TRIGGERS ------
      CREATE TRIGGER presences_hist_insert AFTER INSERT ON public.presences
      FOR EACH ROW EXECUTE FUNCTION log_presences_insert();
    `)
  }

  public async down() {
    this.schema.dropTable(this.tableName)

    // jangan lupa drop trigger & function
    this.schema.raw("DROP TRIGGER IF EXISTS presences_history_insert ON public.presences;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_presences_insert() CASCADE;")
  }
}
