import BaseSeeder from "@ioc:Adonis/Lucid/Seeder"
import AcademicYear from "../../Models/AcademicYear"

export default class extends BaseSeeder {
  public async run() {
    console.log(">>> START seeding table: academic_years")

    const academicYearsToCreate = [
      {
        year: "2021 - 2022",
        description: "Tahun akademik 2021 - 2022"
      },
      {
        year: "2022 - 2023",
        description: "Tahun akademik 2022 - 2023"
      },
    ]

    await AcademicYear.updateOrCreateMany('year', academicYearsToCreate)

    console.log(">>> DONE seeding table: academic_years")
  }
}
