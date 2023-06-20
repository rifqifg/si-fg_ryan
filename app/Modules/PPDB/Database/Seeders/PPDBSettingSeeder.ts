import BaseSeeder from "@ioc:Adonis/Lucid/Seeder"
import PPDBSetting from "../../Models/PPDBSetting"

export default class extends BaseSeeder {
  public async run() {
    console.log(">>> START seeding table: ppdb_settings")

    const ppdbSettingsToCreate = [
      {
        id: "7e8a06bf-82b9-4f4a-9e4d-605d3dc6b7d1",
        guide_content: { "title": "Panduan masa depan", "description": "Gunakan panduan ini sebagai pegangan" },
        active: true
      },
    ]

    await PPDBSetting.updateOrCreateMany('id', ppdbSettingsToCreate)

    console.log(">>> DONE seeding table: ppdb_settings")
  }
}
