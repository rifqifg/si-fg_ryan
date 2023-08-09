import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { StudentGender, StudentProgram, StudentReligion, StudentResidence, StudentUnit } from '../lib/enums'

export default class CreateManyStudentValidator {
  constructor(protected ctx: HttpContextContract, public data: {}) { }

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string({}, [ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string({}, [
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
    manyStudents: schema.array().members(
      schema.object().members({
        name: schema.string({}, [
          rules.minLength(5)]),
        nik: schema.string.optional([
          rules.regex(new RegExp("^[0-9]+$")),
          rules.minLength(16),
          rules.maxLength(16),
          rules.unique({ table: 'academic.students', column: 'nik' })
        ]),
        email: schema.string.optional([
          rules.email(),
          rules.unique({ table: 'academic.students', column: 'email' })
        ]),
        nis: schema.string([
          rules.regex(/^[0-9]+$/),
          rules.unique({ table: 'academic.students', column: 'nis' })
        ]),
        nisn: schema.string.optional([
          rules.regex(/^[0-9]+$/),
          rules.unique({ table: 'academic.students', column: 'nisn' })
        ]),
        birth_city: schema.string.optional(),
        birth_day: schema.date.optional({ format: "yyyy-MM-dd" }),
        religion: schema.enum.optional(Object.values(StudentReligion)),
        address: schema.string.optional({ trim: true }),
        gender: schema.enum.optional(Object.values(StudentGender)),
        rt: schema.string.optional([
          rules.regex(/^[0-9]+$/),
          rules.minLength(1),
          rules.maxLength(3),
        ]),
        rw: schema.string.optional([
          rules.regex(/^[0-9]+$/),
          rules.minLength(1),
          rules.maxLength(3),
        ]),
        zip: schema.string.optional([
          rules.regex(/^[0-9]+$/),
          rules.minLength(5),
          rules.maxLength(5),
        ]),
        phone: schema.string.optional([
          rules.regex(/^[0-9]+$/),
        ]),
        mobile_phone: schema.string.optional([
          rules.regex(/^[0-9]+$/),
        ]),
        residence: schema.enum.optional(Object.values(StudentResidence)),
        transportation: schema.string.optional([
          rules.maxLength(40),
        ]),
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
        child_no: schema.string.optional({ trim: true }, [
          rules.regex(/^[0-9]+$/),
        ]),
        address_lat: schema.number.optional(),
        address_long: schema.number.optional(),
        family_card_no: schema.string.optional(),
        weight: schema.number.optional(),
        height: schema.number.optional(),
        head_circumference: schema.number.optional(),
        siblings: schema.string.optional({ trim: true }, [
          rules.maxLength(2)
        ]),
        distance_to_school_in_km: schema.number.optional(),
        program: schema.enum.optional(Object.values(StudentProgram)),
        unit: schema.enum.optional(Object.values(StudentUnit)),
        bank_name: schema.string.optional({ trim: true }, [
          rules.maxLength(30)
        ]),
        bank_account_owner: schema.string.optional({ trim: true }, [
          rules.maxLength(50)
        ]),
        bank_account_number: schema.string.optional({ trim: true }, [
          rules.maxLength(30)
        ]),
        nat_exam_no: schema.string.optional({ trim: true }, [
          rules.maxLength(30)
        ]),
      })
    )
  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages: CustomMessages = {
    '*': (field, rule) => {
      const numberPattern = /\d+/;
      const match = field.match(numberPattern);
      let number = match ? parseInt(match[0], 10) : null;
      number! += 3;

      const column = field.split('.');

      let cekColumn;
      switch (column[2]) {
        case 'name':
          cekColumn = 'Nama Siswa'
          break;
        case 'gender':
          cekColumn = 'Jenis Kelamin'
          break;
        case 'birth_city':
          cekColumn = 'Tempat Lahir'
          break;
        case 'birth_day':
          cekColumn = 'Tanggal Lahir'
          break;
        case 'religion':
          cekColumn = 'Agama'
          break;
        case 'address':
          cekColumn = 'Alamat'
          break;
        case 'zip':
          cekColumn = 'Kode Pos'
          break;
        case 'residence':
          cekColumn = 'Jenis Tinggal'
          break;
        case 'transportation':
          cekColumn = 'Alat Transportasi'
          break;
        case 'phone':
          cekColumn = 'Telepon'
          break;
        case 'mobile_phone':
          cekColumn = 'HP'
          break;
        case 'junior_hs_cert_no':
          cekColumn = 'SKHUN'
          break;
        case 'has_kps':
          cekColumn = 'Penerima KPS'
        case 'kps_number':
          cekColumn = 'No. KPS'
          break;
        case 'nat_exam_no':
          cekColumn = 'No Peserta Ujian Nasional'
          break;
        case 'has_kip':
          cekColumn = 'Penerima KIP'
          break;
        case 'kip_number':
          cekColumn = 'Nomor KIP'
          break;
        case 'name_on_kip':
          cekColumn = 'Nama di KIP'
          break;
        case 'kks_number':
          cekColumn = 'Nomor KKS'
          break;
        case 'birth_cert_no':
          cekColumn = 'No Registrasi Akta Lahir'
          break;
        case 'bank_name':
          cekColumn = 'Bank'
          break;
        case 'bank_account_number':
          cekColumn = 'Nomor Rekening Bank'
          break;
        case 'bank_account_owner':
          cekColumn = 'Rekening Atas Nama'
          break;
        case 'pip_eligible':
          cekColumn = 'Layak PIP (usulan dari sekolah)'
          break;
        case 'pip_desc':
          cekColumn = 'Alasan Layak PIP'
          break;
        case 'special_needs':
          cekColumn = 'Kebutuhan Khusus'
          break;
        case 'junior_hs_name':
          cekColumn = 'Sekolah Asal'
          break;
        case 'child_no':
          cekColumn = 'Anak ke-berapa'
          break;
        case 'address_lat':
          cekColumn = 'Lintang'
          break;
        case 'address_long':
          cekColumn = 'Bujur'
          break;
        case 'family_card_no':
          cekColumn = 'No KK'
          break;
        case 'weight':
          cekColumn = 'Berat Badan'
          break;
        case 'height':
          cekColumn = 'Tinggi Badan'
          break;
        case 'head_circumference':
          cekColumn = 'Lingkar Kepala'
          break;
        case 'siblings':
          cekColumn = 'Jml. Saudara Kandung'
          break;
        case 'distance_to_school_in_km':
          cekColumn = 'Jarak Rumah ke Sekolah (KM)'
          break;

        default:
          cekColumn = column[2]
          break;
      }

      let cekRule;

      switch (rule) {
        case 'required':
          cekRule = "Data tidak boleh kosong";
          break;
        case 'regex':
          cekRule = "Data berupa angka 0 - 9";
          break;
        case 'unique':
          cekRule = "Data tidak boleh sama";
          break;
        case 'minLength':
          if (column[2] === 'name' || column[2] === 'zip') {
            cekRule = "Kurang dari 5";
          }
          else if (column[2] === 'nik') {
            cekRule = "Kurang dari 16";
          }
          else {
            cekRule = "Kurang dari 1";
          }
          break;
        case 'maxLength':
          if (column[2] === 'nik') {
            cekRule = "Lebih dari 16";
          }
          else if (column[2] === 'rt' || column[2] === 'rw') {
            cekRule = "Lebih dari 3";
          }
          else if (column[2] === 'zip') {
            cekRule = "Lebih dari 5";
          }
          else if (column[2] === 'transportation') {
            cekRule = "Lebih dari 40";
          }
          else if (column[2] === 'siblings') {
            cekRule = "Lebih dari 2";
          }
          else if (column[2] === 'bank_account_owner') {
            cekRule = "Lebih dari 50";
          }
          else {
            cekRule = "Lebih dari 30";
          }
          break;
        default:
          cekRule = rule;
          break;
      }

      return `Baris ${number}: ${cekColumn} - ${cekRule}`
    },
  }
}
