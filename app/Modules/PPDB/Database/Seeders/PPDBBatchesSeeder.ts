import BaseSeeder from "@ioc:Adonis/Lucid/Seeder"
import PPDBBatch from "../../Models/PPDBBatch"

export default class extends BaseSeeder {
  public async run() {
    console.log(">>> START seeding table: ppdb_batches")

    // TODO: buat supaya seeder tidak bisa menerima record dengan nilai active true..
    // ..lebih dari satu record
    const PPDBBatchesToCreate = [
      {
        id: "b0459123-ae5f-4d02-a518-8e6bdf6c1e14",
        name: "Gelombang Umum",
        academicYear: "2021 - 2022",
        description: "Batch 2021-2022",
        active: true
      },
      {
        id: "f71ac16e-9b92-43f2-8e1d-4e4ebd4f9d24",
        name: "Gelombang Khusus",
        academicYear: "2022 - 2023",
        description: "Batch 2022-2023",
        active: false
      }
    ]

    await PPDBBatch.updateOrCreateMany('id', PPDBBatchesToCreate)

    console.log(">>> DONE seeding table: ppdb_batches")
  }
}
