import { schema, CustomMessages, rules } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import {
  StudentGender,
  StudentProgram,
  StudentReligion,
  StudentResidence,
  StudentUnit,
} from "../lib/enums";

export default class UpdateStudentValidator {
  constructor(protected ctx: HttpContextContract) {}

  public refs = schema.refs({
		id: this.ctx.params.id
	})

  public schema = schema.create({
    name: schema.string.nullableAndOptional({}, [
      rules.alpha({ allow: ["space"] }),
      rules.minLength(5),
    ]),
    class_id: schema.string.nullableAndOptional({}, [
      rules.exists({ table: "academic.classes", column: "id" }),
    ]),
    nik: schema.string.nullableAndOptional([
      rules.regex(/^[0-9]+$/),
      rules.minLength(16),
      rules.maxLength(16),
      rules.unique({ table: "academic.students", column: "nik", whereNot: { id: this.refs.id } }),
    ]),
    email: schema.string.nullableAndOptional([
      rules.email(),
      rules.unique({ table: "academic.students", column: "email", whereNot: { id: this.refs.id } }),
    ]),
    nis: schema.string.nullableAndOptional([
      rules.regex(/^[0-9]+$/),
      rules.unique({ table: "academic.students", column: "nis", whereNot: { id: this.refs.id } }),
    ]),
    nisn: schema.string.nullableAndOptional([
      rules.regex(/^[0-9]+$/),
      rules.unique({ table: "academic.students", column: "nisn", whereNot: { id: this.refs.id } }),
    ]),
    isGraduated: schema.boolean.optional(),
    birth_city: schema.string.nullableAndOptional(),
    birth_day: schema.date.nullableAndOptional({ format: "yyyy-MM-dd" }),
    religion: schema.enum.nullableAndOptional(Object.values(StudentReligion)),
    address: schema.string.nullableAndOptional({ trim: true }),
    gender: schema.enum.nullableAndOptional(Object.values(StudentGender)),
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
      rules.exists({ table: "public.wilayah", column: "kode" }),
    ]),
    kec: schema.string.nullableAndOptional([
      rules.minLength(8),
      rules.maxLength(8),
      rules.exists({ table: "public.wilayah", column: "kode" }),
    ]),
    kot: schema.string.nullableAndOptional([
      rules.minLength(5),
      rules.maxLength(5),
      rules.exists({ table: "public.wilayah", column: "kode" }),
    ]),
    prov: schema.string.nullableAndOptional([
      rules.minLength(2),
      rules.maxLength(2),
      rules.exists({ table: "public.wilayah", column: "kode" }),
    ]),
    zip: schema.string.nullableAndOptional([
      rules.regex(/^[0-9]+$/),
      rules.minLength(5),
      rules.maxLength(5),
    ]),
    phone: schema.string.nullableAndOptional([rules.regex(/^[0-9]+$/)]),
    mobile_phone: schema.string.nullableAndOptional([rules.regex(/^[0-9]+$/)]),
    residence: schema.enum.nullableAndOptional(Object.values(StudentResidence)),
    transportation: schema.string.nullableAndOptional([rules.maxLength(40)]),
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
    junior_hs_name: schema.string.nullableAndOptional({ trim: true }),
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
      rules.maxLength(2),
    ]),
    distance_to_school_in_km: schema.number.nullableAndOptional(),
    program: schema.enum.nullableAndOptional(Object.values(StudentProgram)),
    unit: schema.enum.nullableAndOptional(Object.values(StudentUnit)),
    bank_name: schema.string.nullableAndOptional({ trim: true }, [
      rules.maxLength(30),
    ]),
    bank_account_owner: schema.string.nullableAndOptional({ trim: true }, [
      rules.maxLength(50),
    ]),
    bank_account_number: schema.string.nullableAndOptional({ trim: true }, [
      rules.maxLength(30),
    ]),
    nat_exam_no: schema.string.nullableAndOptional({ trim: true }, [
      rules.maxLength(30),
    ]),
    foundationId: schema.string.optional([rules.exists({table: 'foundation.foundations', column: 'id'})]),
  });

  public messages: CustomMessages = {
    regex: "Only accept numbers",
  };
}
