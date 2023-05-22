import BaseSeeder from "@ioc:Adonis/Lucid/Seeder"
import Student from "../../Models/Student"
import { StudentGender, StudentProgram, StudentReligion, StudentResidence, StudentUnit } from "../../lib/enums"

export default class extends BaseSeeder {
  public async run() {
    console.log(">>> START seeding table: students")

    const studentsToCreate = [
      {
        id: "c57be98a-70da-4514-a94e-050dadc7eda5",
        class_id: "ff74121f-e13d-413a-9250-bd488dac6f0c",
        nik: "3509201101100012",
        name: "DUMMY DATA siswa1",
        nis: "02321821223",
        nisn: "00231483223972",
        birth_city: "situbondo",
        birth_day: "2000-09-24",
        address: "DUMMY ADDRESS No.1",
        rt: "002",
        rw: "011",
        kec: "11.11.11",
        kot: "11.11",
        prov: "11",
        zip: "14723",
        phone: "0331414010",
        mobile_phone: "08123445678",
        email: "tuan_mister3225@gmail.com",
        created_at: "2023-05-21T06:12:02.519Z",
        updated_at: "2023-05-21T06:12:02.519Z",
        // student_status: null,
        kel: "11.11.11.2001",
        religion: StudentReligion.ISLAM,
        gender: StudentGender.MALE,
        residence: StudentResidence.WITH_PARENT,
        transportation: "public transportation",
        has_kps: true,
        kps_number: "1212112",
        junior_hs_cert_no: "23/III/2022",
        has_kip: false,
        kip_number: "121212",
        name_on_kip: false,
        has_kks: true,
        kks_number: "121212",
        birth_cert_no: "1212/32/III",
        pip_eligible: true,
        pip_desc: "isi dengan alasan kenapa layak/tidak layak pip",
        special_needs: "tidak ada",
        junior_hs_name: "SMPN 1 JEMBER",
        child_no: "2",
        address_lat: 21.11,
        address_long: 111.11,
        family_card_no: "350920121212121",
        weight: 45.8,
        height: 164.5,
        head_circumference: 23.3,
        siblings: "2",
        distance_to_school_in_km: 4,
        program: StudentProgram.FD,
        unit: StudentUnit.PUTRA,
        bank_name: "BSI",
        bank_account_owner: "tuan anak",
        bank_account_number: "211121221",
        nat_exam_no: "12121122",
      },
    ]

    await Student.updateOrCreateMany('id', studentsToCreate)

    console.log(">>> DONE seeding table: students")
  }
}
