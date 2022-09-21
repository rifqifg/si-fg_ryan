import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Role from 'App/Models/Role'

export default class extends BaseSeeder {
  public async run() {
    console.log('>>> seeding role');

    await Role.createMany([
      { name: 'admin' },
      { name: 'employee' },
      { name: 'piket' },
      { name: 'qa' },
      { name: 'super_admin' },
    ])
  }
}
