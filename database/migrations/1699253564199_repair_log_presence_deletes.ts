import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  public async up () {
    this.schema.raw("DROP TRIGGER IF EXISTS presences_hist_delete ON public.presences;")
    this.schema.raw("DROP TRIGGER IF EXISTS presences_hist_delete ON academic.teacher_attendances;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_presences_delete() CASCADE;")

    this.schema.raw(`
      ------ FUNCTIONS ------
      CREATE OR REPLACE FUNCTION log_presences_delete() RETURNS TRIGGER AS $$
      DECLARE
          old_data public.presences;
      BEGIN
          old_data := OLD;
          INSERT INTO public.presence_hists (presence_id, activity_id, employee_id, action_type, time_in, time_out, description, server_user_id, server_ip, server_hostname)
          VALUES (OLD.id, OLD.activity_id, OLD.employee_id, 'DELETE', OLD.time_in, OLD.time_out, OLD.description, OLD.client_user_id, OLD.client_ip, OLD.client_hostname);
          RETURN OLD;
      END;
      $$ LANGUAGE plpgsql;

      ------ TRIGGERS ------
      CREATE TRIGGER presences_hist_delete BEFORE DELETE ON public.presences
      FOR EACH ROW EXECUTE FUNCTION log_presences_delete();
    `)
  }

  public async down () {
    this.schema.raw("DROP TRIGGER IF EXISTS presences_hist_delete ON public.presences;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_presences_delete() CASCADE;")
  }
}
