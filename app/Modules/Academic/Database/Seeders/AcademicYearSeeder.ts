import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import AcademicYear from '../../Models/AcademicYear'

export default class extends BaseSeeder {
  public async run() {
    console.log(">>> START seeding table: academic.academic_years")

    const acToCreate = [
      {
        year: "2020 - 2021",
        description: "Tahun akademik 2020/2021"
      },
      {
        year: "2021 - 2022",
        description: "Tahun akademik 2021/2022"
      },
      {
        year: "2022 - 2023",
        description: "Tahun akademik 2022/2023"
      },
      {
        year: "2023 - 2024",
        description: "Tahun akademik 2023/2024",
        active: true
      }
    ]

    await AcademicYear.updateOrCreateMany('year', acToCreate)

    console.log(">>> DONE seeding table: academic.academic_years")
  }
}
