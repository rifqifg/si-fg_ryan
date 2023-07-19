import { schema, CustomMessages, rules } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import {
  StudentGender,
  StudentProgram,
  StudentReligion,
  StudentResidence,
  StudentUnit,
} from "../lib/enums";

export default class CreateStudentValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({}, [
      rules.alpha({ allow: ["space"] }),
      rules.minLength(5),
    ]),
    class_id: schema.string({}, [
      rules.uuid({ version: 4 }),
      rules.exists({ table: "academic.classes", column: "id" }),
    ]),
    nik: schema.string([
      rules.regex(new RegExp("^[0-9]+$")),
      rules.minLength(16),
      rules.maxLength(16),
      rules.unique({ table: "academic.students", column: "nik" }),
    ]),
    email: schema.string.optional([
      rules.email(),
      rules.unique({ table: "academic.students", column: "email" }),
    ]),
    nis: schema.string.optional([
      rules.regex(/^[0-9]+$/),
      rules.unique({ table: "academic.students", column: "nis" }),
    ]),
    nisn: schema.string.optional([
      rules.regex(/^[0-9]+$/),
      rules.unique({ table: "academic.students", column: "nisn" }),
    ]),
    isGraduated: schema.boolean(),
    birth_city: schema.string.optional(),
    birth_day: schema.date.optional({ format: "yyyy-MM-dd" }),
    religion: schema.enum.optional(Object.values(StudentReligion)),
    address: schema.string.optional({ trim: true }),
    gender: schema.enum.optional(Object.values(StudentGender)),
    rt: schema.string.optional([
      rules.regex(/^[0-9]+$/),
      rules.minLength(3),
      rules.maxLength(3),
    ]),
    rw: schema.string.optional([
      rules.regex(/^[0-9]+$/),
      rules.minLength(3),
      rules.maxLength(3),
    ]),
    kel: schema.string.optional([
      rules.minLength(13),
      rules.maxLength(13),
      rules.exists({ table: "public.wilayah", column: "kode" }),
    ]),
    kec: schema.string.optional([
      rules.minLength(8),
      rules.maxLength(8),
      rules.exists({ table: "public.wilayah", column: "kode" }),
    ]),
    kot: schema.string.optional([
      rules.minLength(5),
      rules.maxLength(5),
      rules.exists({ table: "public.wilayah", column: "kode" }),
    ]),
    prov: schema.string.optional([
      rules.minLength(2),
      rules.maxLength(2),
      rules.exists({ table: "public.wilayah", column: "kode" }),
    ]),
    zip: schema.string.optional([
      rules.regex(/^[0-9]+$/),
      rules.minLength(5),
      rules.maxLength(5),
    ]),
    phone: schema.string.optional([rules.regex(/^[0-9]+$/)]),
    mobile_phone: schema.string.optional([rules.regex(/^[0-9]+$/)]),
    residence: schema.enum.optional(Object.values(StudentResidence)),
    transportation: schema.string.optional([rules.maxLength(40)]),
    has_kps: schema.boolean.optional(),
    kps_number: schema.string.optional({ trim: true }),
    junior_hs_cert_no: schema.string.optional({ trim: true }),
    has_kip: schema.boolean.optional(),
    kip_number: schema.string.optional({ trim: true }),
    name_on_kip: schema.boolean.optional(),
    has_kks: schema.boolean.optional(),
    kks_number: schema.string.optional({ trim: true }),
    birth_cert_no: schema.string.optional({ trim: true }),
    pip_eligible: schema.boolean.optional(),
    pip_desc: schema.string.optional({ trim: true }),
    special_needs: schema.string.optional({ trim: true }),
    junior_hs_name: schema.string.optional({ trim: true }),
    child_no: schema.string.optional({ trim: true }, [rules.regex(/^[0-9]+$/)]),
    address_lat: schema.number.optional(),
    address_long: schema.number.optional(),
    family_card_no: schema.string.optional(),
    weight: schema.number.optional(),
    height: schema.number.optional(),
    head_circumference: schema.number.optional(),
    siblings: schema.string.optional({ trim: true }, [rules.maxLength(2)]),
    distance_to_school_in_km: schema.number.optional(),
    program: schema.enum.optional(Object.values(StudentProgram)),
    unit: schema.enum.optional(Object.values(StudentUnit)),
    bank_name: schema.string.optional({ trim: true }, [rules.maxLength(30)]),
    bank_account_owner: schema.string.optional({ trim: true }, [
      rules.maxLength(50),
    ]),
    bank_account_number: schema.string.optional({ trim: true }, [
      rules.maxLength(30),
    ]),
    nat_exam_no: schema.string.optional({ trim: true }, [rules.maxLength(30)]),
  });

  public messages: CustomMessages = {
    regex: "Only accept numbers",
  };
}
