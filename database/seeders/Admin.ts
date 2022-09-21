import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User';

export default class extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
    console.log('>>> seeding Admin');
    const users = await User.findBy('email', 'it@smafg.sch.id')
    if (users) {
      await users.delete()
    }

    await User.create({
      name: 'superadmin',
      email: 'it@smafg.sch.id',
      password: 'adminSUPER',
      role: 'super_admin',
      verified: true
    })

  }
}
