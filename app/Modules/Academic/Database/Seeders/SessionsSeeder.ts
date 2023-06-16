import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Session from '../../Models/Session';

export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    console.log("=====> START SEEDER SESSIONS");

    await Session.createMany([
      {
        'session': "Sesi 1",
        'time_in': "07:20:00",
        'time_out': '08:40:00'
      },
      {
        'session': "Sesi 2",
        'time_in': "08:40:00",
        'time_out': '10:00:00'
      },
      {
        'session': "Sesi 3",
        'time_in': "10:15:00",
        'time_out': '11:35:00'
      },
      {
        'session': "Sesi 4",
        'time_in': "13:00:00",
        'time_out': '14:20:00'
      },
      {
        'session': "Sesi 5",
        'time_in': "14:20:00",
        'time_out': '15:40:00'
      },
      {
        'session': "Sesi 1 jum'at",
        'time_in': "07:20:00",
        'time_out': '08:30:00'
      },
      {
        'session': "Sesi 2 jum'at",
        'time_in': "08:30:00",
        'time_out': '09:40:00'
      },
      {
        'session': "Sesi 3 jum'at",
        'time_in': "09:55:00",
        'time_out': '11:05:00'
      },
      {
        'session': "Sesi 4 jum'at",
        'time_in': "13:10:00",
        'time_out': '14:20:00'
      },
      {
        'session': "Sesi 5 jum'at",
        'time_in': "14:20:00",
        'time_out': '15:30:00'
      },
    ])

    console.log("=====> DONE SEEDER SESSIONS");
  }
}
