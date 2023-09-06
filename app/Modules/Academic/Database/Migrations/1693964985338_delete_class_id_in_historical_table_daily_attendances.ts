import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'academic.daily_attendances_hists'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
    this.schema.raw("DROP TRIGGER IF EXISTS daily_attendance_hist_insert ON academic.daily_attendances;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_daily_attendance_insert() CASCADE;")
    this.schema.raw("DROP TRIGGER IF EXISTS daily_attendance_hist_update ON academic.daily_attendances;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_daily_attendance_update() CASCADE;")
    this.schema.raw("DROP TRIGGER IF EXISTS daily_attendance_hist_delete ON academic.daily_attendances;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_daily_attendance_delete() CASCADE;")
      
    this.schema.raw(`
      ------ FUNCTIONS ------
      CREATE OR REPLACE FUNCTION log_daily_attendance_insert() RETURNS TRIGGER AS $$
      BEGIN
          INSERT INTO academic.daily_attendances_hists (daily_attendance_id, date_in, date_out, status, description, student_id)
          VALUES (new.id, NEW.date_in, 'INSERT', NEW.date_out, NEW.status, NEW.description, NEW.student_id);
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      ------ TRIGGERS ------
      CREATE TRIGGER daily_attendance_hist_insert AFTER INSERT ON academic.daily_attendances
      FOR EACH ROW EXECUTE FUNCTION log_daily_attendance_insert();

      ------ FUNCTIONS ------
      CREATE OR REPLACE FUNCTION log_daily_attendance_update() RETURNS TRIGGER AS $$
      BEGIN
          INSERT INTO academic.daily_attendances_hists (daily_attendance_id, date_in, date_out, status, description,  student_id)
          VALUES (new.id, NEW.daily_attendance_id, NEW.date_in, 'INSERT', NEW.date_out, NEW.status, NEW.description, NEW.student_id);
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      ------ TRIGGERS ------
      CREATE TRIGGER daily_attendance_hist_update AFTER UPDATE ON academic.daily_attendances
      FOR EACH ROW EXECUTE FUNCTION log_daily_attendance_update();

      ------ FUNCTIONS ------
      CREATE OR REPLACE FUNCTION log_daily_attendance_delete() RETURNS TRIGGER AS $$
      DECLARE
          old_data academic.daily_attendances_hists;
      BEGIN
          old_data := OLD;
          UPDATE academic.daily_attendances_hists SET action_type = 'DELETE' WHERE id = old_data.id;
          RETURN OLD;
      END;
      $$ LANGUAGE plpgsql;

      ------ TRIGGERS ------
      CREATE TRIGGER daily_attendance_hist_delete BEFORE DELETE ON academic.daily_attendances
      FOR EACH ROW EXECUTE FUNCTION log_daily_attendance_delete();
    `)
  
  })

    
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      this.schema.raw("DROP TRIGGER IF EXISTS daily_attendance_hist_insert ON academic.daily_attendances;")
      this.schema.raw("DROP FUNCTION IF EXISTS log_daily_attendance_insert() CASCADE;")
      this.schema.raw("DROP TRIGGER IF EXISTS daily_attendance_hist_update ON academic.daily_attendances;")
      this.schema.raw("DROP FUNCTION IF EXISTS log_daily_attendance_update() CASCADE;")
      this.schema.raw("DROP TRIGGER IF EXISTS daily_attendance_hist_delete ON academic.daily_attendances;")
      this.schema.raw("DROP FUNCTION IF EXISTS log_daily_attendance_delete() CASCADE;")
       
    })
  }
}

