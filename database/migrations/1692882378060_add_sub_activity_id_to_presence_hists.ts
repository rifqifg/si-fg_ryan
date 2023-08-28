import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'presence_hists'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('sub_activity_id').references('id').inTable('sub_activities').onDelete('set null')
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

      ------ FUNCTIONS ------
      CREATE OR REPLACE FUNCTION log_presences_update() RETURNS TRIGGER AS $$
      BEGIN
          INSERT INTO public.presence_hists (presence_id, activity_id, employee_id, action_type, time_in, time_out, description, server_user_id, server_ip, server_hostname, sub_activity_id)
          VALUES (new.id, NEW.activity_id, NEW.employee_id, 'UPDATE', NEW.time_in, NEW.time_out, NEW.description, NEW.client_user_id, NEW.client_ip, NEW.client_hostname, NEW.sub_activity_id);
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      ------ TRIGGERS ------
      CREATE TRIGGER presences_hist_update AFTER UPDATE ON public.presences
      FOR EACH ROW EXECUTE FUNCTION log_presences_update();

      ------ FUNCTIONS ------
      CREATE OR REPLACE FUNCTION log_presences_delete() RETURNS TRIGGER AS $$
      DECLARE
          old_data public.presences;
      BEGIN
          old_data := OLD;
          UPDATE public.presence_hists SET action_type = 'DELETE' WHERE id = old_data.id;
          RETURN OLD;
      END;
      $$ LANGUAGE plpgsql;

      ------ TRIGGERS ------
      CREATE TRIGGER presences_hist_delete BEFORE DELETE ON public.presences
      FOR EACH ROW EXECUTE FUNCTION log_presences_delete();

    `)
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('sub_activity_id')
    })
    // jangan lupa drop trigger & function
    this.schema.raw("DROP TRIGGER IF EXISTS presences_hist_insert ON public.presences;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_presences_insert() CASCADE;")
    this.schema.raw("DROP TRIGGER IF EXISTS presences_hist_update ON public.presences;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_presences_update() CASCADE;")
    this.schema.raw("DROP TRIGGER IF EXISTS presences_hist_delete ON public.presences;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_presences_delete() CASCADE;")
  }
}

// INSERT INTO public.presence_hists (presence_id, activity_id, employee_id, action_type, time_in, time_out, description, server_user_id, server_ip, server_hostname, sub_activity_id)
//           VALUES (old_data.id, old_data.activity_id, old_data.employee_id, 'DELETE', old_data.time_in, old_data.time_out, old_data.description, old_data.client_user_id, old_data.client_ip, old_data.client_hostname, old_data.sub_activity_id);
//           RETURN OLD;
