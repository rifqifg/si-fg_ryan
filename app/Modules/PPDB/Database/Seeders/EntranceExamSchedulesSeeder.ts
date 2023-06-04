import BaseSeeder from "@ioc:Adonis/Lucid/Seeder"
import EntranceExamSchedule from "../../Models/EntranceExamSchedule"
import { DateTime } from "luxon"

export default class extends BaseSeeder {
  public async run() {
    console.log(">>> START seeding table: entrance_exam_schedules")

    const EntranceExamSchedulesToCreate = [
      {
        id: "f56c9d3e-8a15-4f94-9c76-5b3a5bcac7dc",
        batchId: "b0459123-ae5f-4d02-a518-8e6bdf6c1e14",
        maxCapacity: 200,
        currentQuota: 50,
        timeStart: DateTime.local(2021, 4, 1, 11, 10, { zone: "utc+7" }),
        timeEnd: DateTime.local(2021, 4, 1, 13, 10, { zone: "utc+7" }),
      },
      {
        id: "e8b1e77e-1066-4e89-ba50-b9b4f2df55f3",
        batchId: "f71ac16e-9b92-43f2-8e1d-4e4ebd4f9d24",
        maxCapacity: 50,
        currentQuota: 10,
        timeStart: DateTime.local(2023, 4, 1, 11, 10, { zone: "utc+7" }),
        timeEnd: DateTime.local(2023, 4, 1, 13, 10, { zone: "utc+7" }),
      }
    ]

    await EntranceExamSchedule.updateOrCreateMany('id', EntranceExamSchedulesToCreate)

    console.log(">>> DONE seeding table: entrance_exam_schedules")
  }
}
