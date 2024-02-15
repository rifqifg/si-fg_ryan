import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Foundation from 'App/Modules/Foundation/Models/Foundation'

export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    console.log(">>> START seeding table: foundations")
    await Foundation.create({
      id: "c1d3e93b-1774-4682-9a81-c1915742c8e2",
      name: "Yayasan Islam Prambanan",
      description: "SMA FG"
    })
    console.log(">>> END seeding table: foundations")
  }
}
