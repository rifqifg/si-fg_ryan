import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'academic.teacher_attendances_hists'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('action_type').notNullable()
      this.schema.raw("DROP TRIGGER IF EXISTS teacher_attendance_hist_insert ON academic.teacher_attendances;")
      this.schema.raw("DROP FUNCTION IF EXISTS log_teacher_attendance_insert() CASCADE;")
      this.schema.raw("DROP TRIGGER IF EXISTS teacher_attendance_hist_update ON academic.teacher_attendances;")
      this.schema.raw("DROP FUNCTION IF EXISTS log_teacher_attendance_update() CASCADE;")
      this.schema.raw("DROP TRIGGER IF EXISTS teacher_attendance_hist_delete ON academic.teacher_attendances;")
      this.schema.raw("DROP FUNCTION IF EXISTS log_teacher_attendance_delete() CASCADE;")

      this.schema.raw(`
      ------ FUNCTIONS ------
      CREATE OR REPLACE FUNCTION log_teacher_attendance_insert() RETURNS TRIGGER AS $$
      BEGIN
          INSERT INTO academic.teacher_attendances_hists (teacher_attendance_id, date_in, action_type, date_out, status, material, reason_not_teach, post_test, session_id, teacher_id, class_id, subject_id, program_semester_detail_id)
          VALUES (new.id, NEW.date_in, 'INSERT', NEW.date_out, NEW.status, NEW.material, NEW.reason_not_teach, NEW.post_test, NEW.session_id, NEW.teacher_id, NEW.class_id, NEW.subject_id, NEW.program_semester_detail_id);
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      ------ TRIGGERS ------
      CREATE TRIGGER teacher_attendance_hist_insert AFTER INSERT ON academic.teacher_attendances
      FOR EACH ROW EXECUTE FUNCTION log_teacher_attendance_insert();

      ------ FUNCTIONS ------
      CREATE OR REPLACE FUNCTION log_teacher_attendance_update() RETURNS TRIGGER AS $$
      BEGIN
          INSERT INTO academic.teacher_attendances_hists (teacher_attendance_id, date_in, action_type, date_out, status, material, reason_not_teach, post_test, session_id, teacher_id, class_id, subject_id, program_semester_detail_id)
          VALUES (new.id, NEW.date_in, 'UPDATE', NEW.date_out, NEW.status, NEW.material, NEW.reason_not_teach, NEW.post_test, NEW.session_id, NEW.teacher_id, NEW.class_id, NEW.subject_id, NEW.program_semester_detail_id);
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      ------ TRIGGERS ------
      CREATE TRIGGER teacher_attendance_hist_update AFTER UPDATE ON academic.teacher_attendances
      FOR EACH ROW EXECUTE FUNCTION log_teacher_attendance_update();

      ------ FUNCTIONS ------
      CREATE OR REPLACE FUNCTION log_teacher_attendance_delete() RETURNS TRIGGER AS $$
      DECLARE
          old_data academic.teacher_attendances_hists;
      BEGIN
          old_data := OLD;
          UPDATE academic.teacher_attendances_hists SET action_type = 'DELETE' WHERE id = old_data.id;
          RETURN OLD;
      END;
      $$ LANGUAGE plpgsql;

      ------ TRIGGERS ------
      CREATE TRIGGER teacher_attendance_hist_delete BEFORE DELETE ON academic.teacher_attendances
      FOR EACH ROW EXECUTE FUNCTION log_teacher_attendance_delete();
    `)


    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
    table.dropColumn('action_type')
    this.schema.raw("DROP TRIGGER IF EXISTS teacher_attendance_hist_insert ON academic.teacher_attendances;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_teacher_attendance_insert() CASCADE;")
    this.schema.raw("DROP TRIGGER IF EXISTS teacher_attendance_hist_update ON academic.teacher_attendances;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_teacher_attendance_update() CASCADE;")
    this.schema.raw("DROP TRIGGER IF EXISTS teacher_attendance_hist_delete ON academic.teacher_attendances;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_teacher_attendance_delete() CASCADE;")
    })
  }
}
