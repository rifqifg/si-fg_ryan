import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Module from 'App/Models/Module'

export default class extends BaseSeeder {
  public async run() {
    console.log('>>> seeding Modules');
    // Write your database queries inside the run method
    await Module.createMany([
      { id: 'mdlAcademic' },
      { id: 'mdlHRD' },
      { id: 'mdlProfile2' },
      { id: 'mdlSystem' }
    ])
  }
}