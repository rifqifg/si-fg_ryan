import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'presence_hists'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('sub_activity_id').references('id').inTable('sub_activities').onDelete('cascade')
    })

    this.schema.raw("DROP TRIGGER IF EXISTS presences_hist_insert ON public.presences;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_presences_insert() CASCADE;")

    this.schema.raw(`
      ------ FUNCTIONS ------
      CREATE OR REPLACE FUNCTION log_presences_insert() RETURNS TRIGGER AS $$
      BEGIN
          INSERT INTO public.presence_hists (presence_id, activity_id, employee_id, action_type, time_in, time_out, description, server_user_id, server_ip, server_hostname, sub_activity_id)
          VALUES (new.id, NEW.activity_id, NEW.employee_id, 'INSERT', NEW.time_in, NEW.time_out, NEW.description, NEW.client_user_id, NEW.client_ip, NEW.client_hostname, NEW.sub_activity_id);
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      ------ TRIGGERS ------
      CREATE TRIGGER presences_hist_insert AFTER INSERT ON public.presences
      FOR EACH ROW EXECUTE FUNCTION log_presences_insert();
    `)
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('sub_activity_id')
    })
    // jangan lupa drop trigger & function
    this.schema.raw("DROP TRIGGER IF EXISTS presences_history_insert ON public.presences;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_presences_insert() CASCADE;")
  }
}
