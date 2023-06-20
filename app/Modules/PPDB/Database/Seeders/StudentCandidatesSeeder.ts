import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import StudentCandidate from '../../Models/StudentCandidate'

export default class extends BaseSeeder {
  public async run() {
    console.log(">>> START seeding table: student_candidates")

    const studentCandidateToCreate = [
      {
        id: "a3760e48-3f86-4b78-9a8d-c0a6c40e3a0d",
        userId: "a9d7c2f6-6b84-4c7e-9c2f-82aefc325e1d",
        registrationId: "special_reg_id",
        fullName: "Rel Mayer"
      },
      {
        id: "c5e9b8d7-09b1-4b89-8bc5-61a297fd3d8a",
        userId: "7d36f602-efdc-43c9-8ce0-6a8c5a305f7b",
        registrationId: "special_reg_id2",
        fullName: "Arsy Berlian"
      }
    ]

    await StudentCandidate.fetchOrCreateMany('id', studentCandidateToCreate)

    console.log(">>> DONE seeding table: student_candidates")
  }
}
