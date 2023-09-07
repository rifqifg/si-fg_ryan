import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'presence_hists'

  public async up () {
    this.schema.raw("DROP TRIGGER IF EXISTS presences_hist_delete ON public.presences;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_presences_delete() CASCADE;")

    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('activity_id')
      table.dropForeign('presence_id')
      table.dropForeign('employee_id')
      table.dropForeign('server_user_id')
      table.dropForeign('sub_activity_id')
    })

    this.schema.raw(`
      ------ FUNCTIONS ------
      CREATE OR REPLACE FUNCTION log_presences_delete() RETURNS TRIGGER AS $$
      DECLARE
          old_data public.presences;
      BEGIN
          old_data := OLD;
          INSERT INTO public.presence_hists (presence_id, activity_id, employee_id, action_type, time_in, time_out, description, server_user_id, server_ip, server_hostname)
          VALUES (OLD.id, OLD.activity_id, OLD.employee_id, 'INSERT', OLD.time_in, OLD.time_out, OLD.description, OLD.client_user_id, OLD.client_ip, OLD.client_hostname);
          RETURN OLD;
      END;
      $$ LANGUAGE plpgsql;

      ------ TRIGGERS ------
      CREATE TRIGGER presences_hist_delete BEFORE DELETE ON academic.teacher_attendances
      FOR EACH ROW EXECUTE FUNCTION log_presences_delete();
    `)
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.foreign('activity_id').references('id').inTable('activities').onDelete('set null')
      table.foreign('presence_id').references('id').inTable('presences').onDelete('set null')
      table.foreign('employee_id').references('id').inTable('employees').onDelete('set null')
      table.foreign('server_user_id').references('id').inTable('users').onDelete('set null')
      table.foreign('sub_activity_id').references('id').inTable('sub_activities').onDelete('set null')
      this.schema.raw("DROP TRIGGER IF EXISTS presences_hist_delete ON public.presences;")
      this.schema.raw("DROP FUNCTION IF EXISTS log_presences_delete() CASCADE;")
    })
  }
}
