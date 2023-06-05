import BaseSeeder from "@ioc:Adonis/Lucid/Seeder"
import UserStudentCandidate from "../../Models/UserStudentCandidate"

export default class extends BaseSeeder {
  public async run() {
    console.log(">>> START seeding table: user_student_candidates")

    // TODO: nisn violate unique constraint jika record sudah ada
    const USCToCreate = [
      {
        "id": "a9d7c2f6-6b84-4c7e-9c2f-82aefc325e1d",
        "nisn": "2264664128",
        "name": "Rel Mayer",
        "email": "ryanrfq5@gmail.com",
        "password": "himitsu",
        "verified": true
      },
      {
        "id": "7d36f602-efdc-43c9-8ce0-6a8c5a305f7b",
        "nisn": "2264664125",
        "name": "Arsy Berlian",
        "email": "arsyberlian1@gmail.com",
        "password": "111111",
        "verified": true
      },
    ]

    await UserStudentCandidate.fetchOrCreateMany('id', USCToCreate)

    console.log(">>> DONE seeding table: user_student_candidates")
  }
}
