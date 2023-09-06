import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { StudentGender, StudentProgram, StudentResidence, StudentUnit } from '../../lib/enums'

export default class extends BaseSchema {
  protected tableName = 'student_hists'

  public async up () {
    this.schema.withSchema('academic')
    .createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique().defaultTo(this.raw("gen_random_uuid()"))
      table.uuid('student_id').references('id').inTable('academic.students').notNullable().onDelete('no action')
      table.uuid('class_id').references('id').inTable('academic.classes').nullable().onDelete('no action').onUpdate('cascade').primary()
      table.string('nik').notNullable().unique()
      table.string('name').notNullable()
      table.string('nis')
      table.string('nisn')
      table.string('birth_city')
      table.date('birth_day')
      table.string('religion')
      table.string('address')
      table.string('rt', 3)
      table.string('rw', 3)
      table.string('kel', 13).references('kode').inTable('public.wilayah').onDelete('no action').onUpdate('cascade')
      table.string('kec', 8).references('kode').inTable('public.wilayah').onDelete('no action').onUpdate('cascade')
      table.string('kot', 5).references('kode').inTable('public.wilayah').onDelete('no action').onUpdate('cascade')
      table.string('prov', 2).references('kode').inTable('public.wilayah').onDelete('no action').onUpdate('cascade')
      table.string('zip', 5)
      table.string('phone')
      table.string('mobile_phone')
      table.string('email')
      table.enum('student_status', ['AKTIF', 'MUTASI', 'MENGUNDURKAN DIRI', 'LAINNYA', 'DIKELUARKAN', 'WAFAT'])
      table.enum('gender', Object.values(StudentGender))
      table.enum('residence', Object.values(StudentResidence))
      table.string('transportation', 40)
      table.boolean('has_kps').defaultTo(false)
      table.string('kps_number')
      table.string('junior_hs_cert_no')
      table.boolean('has_kip').defaultTo(false)
      table.string('kip_number')
      table.boolean('name_on_kip').defaultTo(false)
      table.boolean('has_kks').defaultTo(false)
      table.string('kks_number')
      table.string('birth_cert_no')
      table.boolean('pip_eligible').defaultTo(false)
      table.string('pip_desc')
      table.string('special_needs')
      table.string('junior_hs_name')
      table.string('child_no')
      table.decimal('address_lat')
      table.decimal('address_long')
      table.string('family_card_no')
      table.decimal('weight')
      table.decimal('height')
      table.decimal('head_circumference')
      table.string('siblings', 2)
      table.integer('distance_to_school_in_km')
      table.enum('program', Object.values(StudentProgram))
      table.enum('unit', Object.values(StudentUnit))
      table.string('bank_name', 30)
      table.string('bank_account_owner', 50)
      table.string('bank_account_number', 30)
      table.string('nat_exam_no', 30)

      this.schema.raw(`
      ------ FUNCTIONS ------
      CREATE OR REPLACE FUNCTION log_student_insert() RETURNS TRIGGER AS $$
      BEGIN
          INSERT INTO academic.student_hists (student_id, class_id, nik, name, nis, nisn, birth_city, birth_day, religion, address, rt, rw, kel, kec, kot, prov, zip, phone, mobile_phone, email, student_status, gender, residence, tranportation, has_kps, kps_number, junior_hs_cert_no, has_kip, kip_number, name_on_kip, has_kks, kks_number, birth_cert_no, pip_eligible, pip_desc, special_needs, junior_hs_name, child_no, address_lat, address_long, family_card_no, weight, height, head_circumference, siblings, distance_to_school_in_km, program, unit, bank_name, bank_account_owner, bank_account_number, nat_exam_no)
          VALUES (new.id, NEW.class_id, NEW.nik, 'INSERT', NEW.name, NEW.nis, NEW.nisn, NEW.birth_city, NEW.birth_day, NEW.religion, NEW.address, NEW.rt, NEW.rw, NEW.kel, NEW.kec, NEW.kot, NEW.prov, NEW.zip, NEW.phone, NEW.mobile_phone, NEW.email, NEW.student_status, NEW.gender, NEW.residence, NEW.tranportation, NEW.has_kps, NEW.kps_number, NEW.junior_hs_cert_no, NEW.has_kip, NEW.kip_number, NEW.name_on_kip, NEW.has_kks, NEW.kks_number, NEW.birth_cert_no, NEW.pip_eligible, NEW.pip_desc, NEW.special_needs, NEW.junior_hs_name, NEW.child_no, NEW.address_lat, NEW.address_long, NEW.family_card_no, NEW.weight, NEW.height, NEW.head_circumference, NEW.siblings, NEW.distance_to_school_in_km, NEW.program, NEW.unit, NEW.bank_name, NEW.bank_account_number, NEW.nat_exam_no);
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      ------ TRIGGERS ------
      CREATE TRIGGER student_hist_insert AFTER INSERT ON academic.students
      FOR EACH ROW EXECUTE FUNCTION log_student_insert();

      ------ FUNCTIONS ------
      CREATE OR REPLACE FUNCTION log_student_update() RETURNS TRIGGER AS $$
      BEGIN
          INSERT INTO academic.student_hists (student_id, class_id, nik, name, nis, nisn, birth_city, birth_day, religion, address, rt, rw, kel, kec, kot, prov, zip, phone, mobile_phone, email, student_status, gender, residence, tranportation, has_kps, kps_number, junior_hs_cert_no, has_kip, kip_number, name_on_kip, has_kks, kks_number, birth_cert_no, pip_eligible, pip_desc, special_needs, junior_hs_name, child_no, address_lat, address_long, family_card_no, weight, height, head_circumference, siblings, distance_to_school_in_km, program, unit, bank_name, bank_account_owner, bank_account_number, nat_exam_no)
          VALUES (new.id, NEW.class_id, NEW.nik, 'INSERT', NEW.name, NEW.nis, NEW.nisn, NEW.birth_city, NEW.birth_day, NEW.religion, NEW.address, NEW.rt, NEW.rw, NEW.kel, NEW.kec, NEW.kot, NEW.prov, NEW.zip, NEW.phone, NEW.mobile_phone, NEW.email, NEW.student_status, NEW.gender, NEW.residence, NEW.tranportation, NEW.has_kps, NEW.kps_number, NEW.junior_hs_cert_no, NEW.has_kip, NEW.kip_number, NEW.name_on_kip, NEW.has_kks, NEW.kks_number, NEW.birth_cert_no, NEW.pip_eligible, NEW.pip_desc, NEW.special_needs, NEW.junior_hs_name, NEW.child_no, NEW.address_lat, NEW.address_long, NEW.family_card_no, NEW.weight, NEW.height, NEW.head_circumference, NEW.siblings, NEW.distance_to_school_in_km, NEW.program, NEW.unit, NEW.bank_name, NEW.bank_account_number, NEW.nat_exam_no);
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      ------ TRIGGERS ------
      CREATE TRIGGER student_hist_update AFTER UPDATE ON academic.students
      FOR EACH ROW EXECUTE FUNCTION log_student_update();

      ------ FUNCTIONS ------
      CREATE OR REPLACE FUNCTION log_student_delete() RETURNS TRIGGER AS $$
      DECLARE
          old_data academic.student_hists;
      BEGIN
          old_data := OLD;
          UPDATE academic.student_hists SET action_type = 'DELETE' WHERE id = old_data.id;
          RETURN OLD;
      END;
      $$ LANGUAGE plpgsql;

      ------ TRIGGERS ------
      CREATE TRIGGER student_hist_delete BEFORE DELETE ON academic.students
      FOR EACH ROW EXECUTE FUNCTION log_student_delete();
    `)



      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).defaultTo(this.raw("now()"))
    })
  }

  public async down () {
    this.schema.withSchema('academic').dropTable(this.tableName)
    this.schema.raw("DROP TRIGGER IF EXISTS student_hist_insert ON academic.students;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_student_insert() CASCADE;")
    this.schema.raw("DROP TRIGGER IF EXISTS student_hist_update ON academic.students;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_student_update() CASCADE;")
    this.schema.raw("DROP TRIGGER IF EXISTS student_hist_delete ON academic.students;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_student_delete() CASCADE;")
  }
}
