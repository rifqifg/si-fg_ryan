import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Menu from 'App/Models/Menu'

export default class extends BaseSeeder {
  public async run() {
    console.log('>>> seeding Menus');
    // Write your database queries inside the run method
    await Menu.createMany([
      { id: 'mnuClasses', moduleId: 'mdlAcademic' },
      { id: 'mnuStudents', moduleId: 'mdlAcademic' },
      { id: 'mnuActivity', moduleId: 'mdlHRD' },
      { id: 'mnuDivision', moduleId: 'mdlHRD' },
      { id: 'mnuEmployee', moduleId: 'mdlHRD' },
      { id: 'mnuPresence', moduleId: 'mdlHRD' },
      { id: 'mnuRecapPresence', moduleId: 'mdlHRD' },
      { id: 'mnuTestBaru', moduleId: 'mdlProfile2' },
      { id: 'mnuTestBaru2', moduleId: 'mdlProfile2' },
      { id: 'mnuModule', moduleId: 'mdlSystem' },
      { id: 'mnuRole', moduleId: 'mdlSystem' },
      { id: 'mnuUsers', moduleId: 'mdlSystem' }
    ])
  }
}