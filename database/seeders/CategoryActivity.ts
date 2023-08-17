import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import CategoryActivity from 'App/Models/CategoryActivity'

export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    console.log(">>> START seeding table: Category Activity")

    await CategoryActivity.createMany([
      {
        id: "252b1bbc-9798-4d13-88ef-d377e87454cf",
        name: "KEDISIPLINAN DAN KINERJA",
        description: ""
      },
      {
        id: "57b35ad2-ac16-4852-8ca4-3b9dee1239dd",
        name: "PEMBINAAN",
        description: ""
      },
      {
        id: "a5b28e6d-502d-486d-a106-5d581f5d1dd9",
        name: "PENGEMBANGAN DIRI",
        description: ""
      },
      {
        id: "15f8e217-8c24-4f98-b09e-fc69e3d3de72",
        name: "KARYA",
        description: ""
      }
    ])

    console.log(">>> DONE seeding table: Category A")
  }
}
