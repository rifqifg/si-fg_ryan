import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ClassMajor, StudentGender, StudentProgram, StudentReligion, StudentResidence } from 'App/Modules/Academic/lib/enums'
import { PpdbInfoSource, ScSppChoice, ScStatus } from '../lib/enums'

export default class UpdateScPrimaryDatumValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    // user_id: schema.string.optional({ trim: true }, [
    //   rules.exists({ table: 'ppdb.user_student_candidates', column: 'id' }),
    //   rules.unique({ table: 'ppdb.student_candidates', column: 'user_id' })
    // ]),
    full_name: schema.string.optional(),
    birth_day: schema.date.nullableAndOptional({ format: 'yyyy-MM-dd' }),
    junior_hs_name: schema.string.nullableAndOptional(),
    gender: schema.enum.nullableAndOptional(Object.values(StudentGender)),
    religion: schema.enum.nullableAndOptional(Object.values(StudentReligion)),
    correspondence_phone: schema.string.nullableAndOptional({ trim: true }, [
      rules.regex(/^[0-9]+$/),
    ]),
    correspondence_email: schema.string.nullableAndOptional({ trim: true }, [
      rules.email()
    ]),
    info_source: schema.enum.nullableAndOptional(Object.values(PpdbInfoSource)),
    interest_in_fg: schema.string.nullableAndOptional(),
    spp_choice: schema.enum.nullableAndOptional(Object.values(ScSppChoice)),
    program_choice: schema.enum.nullableAndOptional(Object.values(StudentProgram)),
    major_choice: schema.enum.nullableAndOptional(Object.values(ClassMajor)),
    test_schedule_choice: schema.string.optional({ trim: true }, [
      rules.uuid({ version: 4 }),
      rules.exists({ table: 'ppdb.entrance_exam_schedules', column: 'id' })
    ]),
    nik: schema.string.nullableAndOptional([
      rules.regex(/^[0-9]+$/),
      rules.minLength(16),
      rules.maxLength(16),
      // rules.unique({ table: 'ppdb.student_candidates', column: 'nik' })
    ]),
    birth_city: schema.string.nullableAndOptional(),
    address: schema.string.nullableAndOptional({ trim: true }),
    nisn: schema.string.optional([
      rules.regex(/^[0-9]+$/),
      rules.maxLength(15),
      // todo: uncomment after dev
      // rules.unique({ table: 'ppdb.student_candidates', column: 'nisn' })
    ]),
    virtual_account_no: schema.string.nullableAndOptional({ trim: true }, [
      rules.regex(/^[0-9]+$/),
    ]),
    program_final: schema.enum.nullableAndOptional(Object.values(StudentProgram)),
    major_final: schema.enum.nullableAndOptional(Object.values(ClassMajor)),
    spp_final: schema.enum.nullableAndOptional(Object.values(ScSppChoice)),
    status: schema.enum.nullableAndOptional([
      ScStatus.FAILED_EXAM,
      ScStatus.FAILED_RE_REGISTER,
      ScStatus.PASS_EXAM,
      ScStatus.PASS_RE_REGISTER
    ]),
    desa: schema.string.nullableAndOptional(),
    rt: schema.string.nullableAndOptional([
      rules.regex(/^[0-9]+$/),
      rules.minLength(3),
      rules.maxLength(3),
    ]),
    rw: schema.string.nullableAndOptional([
      rules.regex(/^[0-9]+$/),
      rules.minLength(3),
      rules.maxLength(3),
    ]),
    kel: schema.string.nullableAndOptional([
      rules.minLength(13),
      rules.maxLength(13),
      rules.exists({ table: 'public.wilayah', column: 'kode' })
    ]),
    kec: schema.string.nullableAndOptional([
      rules.minLength(8),
      rules.maxLength(8),
      rules.exists({ table: 'public.wilayah', column: 'kode' })
    ]),
    kot: schema.string.nullableAndOptional([
      rules.minLength(5),
      rules.maxLength(5),
      rules.exists({ table: 'public.wilayah', column: 'kode' })
    ]),
    prov: schema.string.nullableAndOptional([
      rules.minLength(2),
      rules.maxLength(2),
      rules.exists({ table: 'public.wilayah', column: 'kode' })
    ]),
    zip: schema.string.nullableAndOptional([
      rules.regex(/^[0-9]+$/),
      rules.minLength(5),
      rules.maxLength(5),
    ]),
    phone: schema.string.nullableAndOptional([
      rules.regex(/^[0-9]+$/),
    ]),
    mobile_phone: schema.string.nullableAndOptional([
      rules.regex(/^[0-9]+$/),
    ]),
    residence: schema.enum.nullableAndOptional(Object.values(StudentResidence)),
    transportation: schema.string.nullableAndOptional([
      rules.maxLength(40),
    ]),
    has_kps: schema.boolean.nullableAndOptional(),
    kps_number: schema.string.nullableAndOptional({ trim: true }),
    junior_hs_cert_no: schema.string.nullableAndOptional({ trim: true }),
    has_kip: schema.boolean.nullableAndOptional(),
    kip_number: schema.string.nullableAndOptional({ trim: true }),
    name_on_kip: schema.boolean.nullableAndOptional(),
    has_kks: schema.boolean.nullableAndOptional(),
    kks_number: schema.string.nullableAndOptional({ trim: true }),
    birth_cert_no: schema.string.nullableAndOptional({ trim: true }),
    pip_eligible: schema.boolean.nullableAndOptional(),
    pip_desc: schema.string.nullableAndOptional({ trim: true }),
    special_needs: schema.string.nullableAndOptional({ trim: true }),
    child_no: schema.string.nullableAndOptional({ trim: true }, [
      rules.regex(/^[0-9]+$/),
    ]),
    address_lat: schema.number.nullableAndOptional(),
    address_long: schema.number.nullableAndOptional(),
    family_card_no: schema.string.nullableAndOptional(),
    weight: schema.number.nullableAndOptional(),
    height: schema.number.nullableAndOptional(),
    head_circumference: schema.number.nullableAndOptional(),
    siblings: schema.string.nullableAndOptional({ trim: true }, [
      rules.maxLength(2)
    ]),
    distance_to_school_in_km: schema.number.nullableAndOptional(),
    bank_name: schema.string.nullableAndOptional({ trim: true }, [
      rules.maxLength(30)
    ]),
    bank_account_owner: schema.string.nullableAndOptional({ trim: true }, [
      rules.maxLength(50)
    ]),
    bank_account_number: schema.string.nullableAndOptional({ trim: true }, [
      rules.maxLength(30)
    ]),
    nat_exam_no: schema.string.nullableAndOptional({ trim: true }, [
      rules.maxLength(30)
    ]),
    jhs_certificate_scan: schema.string.nullableAndOptional(),
    family_card_scan: schema.string.nullableAndOptional(),
    birth_cert_scan: schema.string.nullableAndOptional(),
    scan_payment_proof: schema.string.nullableAndOptional()
  })

  public messages: CustomMessages = {
    'regex': 'Only accept numbers'
  }
}
