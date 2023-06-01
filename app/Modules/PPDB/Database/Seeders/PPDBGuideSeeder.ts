import BaseSeeder from "@ioc:Adonis/Lucid/Seeder"
import PPDBGuide from "../../Models/PPDBGuide"

export default class extends BaseSeeder {
  public async run() {
    console.log(">>> START seeding table: ppdb_guide")

    const ppdbGuideToCreate = [
      {
        id: "7e8a06bf-82b9-4f4a-9e4d-605d3dc6b7d1",
        content: `{"title": "Panduan masa depan", "description": "Gunakan panduan ini sebagai pegangan"}`
      },
    ]

    await PPDBGuide.updateOrCreateMany('id', ppdbGuideToCreate)

    console.log(">>> DONE seeding table: ppdb_guide")
  }
}
