import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { ParentEducation, ParentRelationship } from '../../lib/enums'
import StudentParent from '../../Models/StudentParent'

export default class extends BaseSeeder {
  public async run() {
    console.log(">>> START seeding table: student_parents")

    const studentParentsToCreate = [
      {
        // TODO: id nya jangan lupa meeen
        id: "5fbfc358-1357-4d7e-b742-7ef0f9f01e46",
        student_id: "c57be98a-70da-4514-a94e-050dadc7eda5",
        relationship_w_student: ParentRelationship.BIOLOGICAL_FATHER,
        nik: "3271052205230001",
        name: "DUMMY DATA Ayah siswa1",
        birth_date: "1967-02-20",
        education: ParentEducation.S1,
        occupation: "Salarymeeen",
        min_salary: "3000000",
        max_salary: "7000000",
        phone_number: "0812345678",
        email: "dummyfather@mail.com",
        address: "DUMMY ADDRESS No.1"
      }
    ]

    await StudentParent.updateOrCreateMany('id', studentParentsToCreate)

    console.log(">>> FINISH seeding table: student_parents")
  }
}
