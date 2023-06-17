import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import Semester from "../../Models/Semester";

export default class extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
    console.log(">>> START seeding table: semester");
    await Semester.createMany([
      {
        id: "d93dca2c-ed2c-47ac-8335-0a7093817d42",
        semesterName: "ganjil",
        isActive: true,
        description: "Semester Ganjil",
      },
      {
        id: "e477351e-3eb7-4df6-a153-136c41968d65",
        semesterName: "genap",
        isActive: false,
        description: "Semester Genap",
      },
    ]);

    console.log(">>> FINISH seeding table: semester");
  }
}
