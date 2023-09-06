import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'daily_attendances_hists'

  public async up () {
    this.schema.withSchema('academic')
    .createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique().defaultTo(this.raw("gen_random_uuid()"))
      table.uuid('daily_attendance_id').references('id').inTable('academic.daily_attendances').notNullable().onDelete('no action')
      table.dateTime('date_in', { useTz: false }).notNullable()
      table.dateTime('date_out', { useTz: false })
      table.enum('status', ['present', 'permission', 'sick', 'absent']).notNullable()
      table.string('description')

      table.uuid('class_id').references('id').inTable('academic.classes').onDelete('cascade').onUpdate('cascade')
      table.uuid('student_id').references('id').inTable('academic.students').onDelete('cascade').onUpdate('cascade')
      this.schema.raw(`
      ------ FUNCTIONS ------
      CREATE OR REPLACE FUNCTION log_daily_attendance_insert() RETURNS TRIGGER AS $$
      BEGIN
          INSERT INTO academic.daily_attendances_hists (daily_attendance_id, date_in, date_out, status, description, class_id, student_id)
          VALUES (new.id, NEW.date_in, 'INSERT', NEW.date_out, NEW.status, NEW.description, NEW.class_id, NEW.student_id);
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      ------ TRIGGERS ------
      CREATE TRIGGER daily_attendance_hist_insert AFTER INSERT ON academic.daily_attendances
      FOR EACH ROW EXECUTE FUNCTION log_daily_attendance_insert();

      ------ FUNCTIONS ------
      CREATE OR REPLACE FUNCTION log_daily_attendance_update() RETURNS TRIGGER AS $$
      BEGIN
          INSERT INTO academic.daily_attendances_hists (daily_attendance_id, date_in, date_out, status, description, class_id, student_id)
          VALUES (new.id, NEW.daily_attendance_id, NEW.date_in, 'INSERT', NEW.date_out, NEW.status, NEW.description, NEW.class_id, NEW.student_id);
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

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).defaultTo(this.raw("now()"))
    })
  }

  public async down () {
    this.schema.withSchema('academic').dropTable(this.tableName)
    this.schema.raw("DROP TRIGGER IF EXISTS daily_attendance_hist_insert ON academic.daily_attendances;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_daily_attendance_insert() CASCADE;")
    this.schema.raw("DROP TRIGGER IF EXISTS daily_attendance_hist_update ON academic.daily_attendances;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_daily_attendance_update() CASCADE;")
    this.schema.raw("DROP TRIGGER IF EXISTS daily_attendance_hist_delete ON academic.daily_attendances;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_daily_attendance_delete() CASCADE;")
  }
}
