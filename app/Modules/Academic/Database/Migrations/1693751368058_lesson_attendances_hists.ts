import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'lesson_attendances_hists'

  public async up () {
    this.schema.withSchema('academic')
    .createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique().defaultTo(this.raw("gen_random_uuid()"))
      table.uuid('lesson_attendance').references('id').inTable('academic.lesson_attendances').notNullable().onDelete('no action')
      table.dateTime('date', { useTz: false }).notNullable()
      table.enum('status', ['present', 'permission', 'sick', 'absent']).notNullable()
      table.string('description')

      table.uuid('session_id').references('id').inTable('academic.sessions').onDelete('cascade').onUpdate('cascade')
      table.uuid('student_id').references('id').inTable('academic.students').onDelete('cascade').onUpdate('cascade')
      table.uuid('subject_id').references('id').inTable('academic.subjects').onDelete('cascade').onUpdate('cascade')

      this.schema.raw(`
      ------ FUNCTIONS ------
      CREATE OR REPLACE FUNCTION log_lesson_attendance_insert() RETURNS TRIGGER AS $$
      BEGIN
          INSERT INTO academic.lesson_attendances_hists (lesson_attendance_id, date, status, description, session_id, student_id, subject_id)
          VALUES (new.id, NEW.date, 'INSERT', NEW.status, NEW.description, NEW.session_id, NEW.student_id, NEW.subject_id);
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      ------ TRIGGERS ------
      CREATE TRIGGER lesson_attendance_hist_insert AFTER INSERT ON academic.lesson_attendances
      FOR EACH ROW EXECUTE FUNCTION log_lesson_attendance_insert();

      ------ FUNCTIONS ------
      CREATE OR REPLACE FUNCTION log_lesson_attendance_update() RETURNS TRIGGER AS $$
      BEGIN
          INSERT INTO academic.lesson_attendances_hists (lesson_attendance_id, date, status, description, session_id, student_id, subject_id)
          VALUES (new.id, NEW.lesson_attendance_id, NEW.date, 'INSERT', NEW.status, NEW.description, NEW.session_id, NEW.student_id, NEW.subject_id);
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      ------ TRIGGERS ------
      CREATE TRIGGER lesson_attendance_hist_update AFTER UPDATE ON academic.lesson_attendances
      FOR EACH ROW EXECUTE FUNCTION log_lesson_attendance_update();

      ------ FUNCTIONS ------
      CREATE OR REPLACE FUNCTION log_lesson_attendance_delete() RETURNS TRIGGER AS $$
      DECLARE
          old_data academic.lesson_attendances_hists;
      BEGIN
          old_data := OLD;
          UPDATE academic.lesson_attendances_hists SET action_type = 'DELETE' WHERE id = old_data.id;
          RETURN OLD;
      END;
      $$ LANGUAGE plpgsql;

      ------ TRIGGERS ------
      CREATE TRIGGER lesson_attendance_hist_delete BEFORE DELETE ON academic.lesson_attendances
      FOR EACH ROW EXECUTE FUNCTION log_lesson_attendance_delete();
    `)

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).defaultTo(this.raw("now()"))
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
    this.schema.raw("DROP TRIGGER IF EXISTS lesson_attendance_hist_insert ON academic.lesson_attendances;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_lesson_attendance_insert() CASCADE;")
    this.schema.raw("DROP TRIGGER IF EXISTS lesson_attendance_hist_update ON academic.lesson_attendances;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_lesson_attendance_update() CASCADE;")
    this.schema.raw("DROP TRIGGER IF EXISTS lesson_attendance_hist_delete ON academic.lesson_attendances;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_lesson_attendance_delete() CASCADE;")
  }
}
