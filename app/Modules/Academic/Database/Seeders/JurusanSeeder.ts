import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Jurusan from '../../Models/Jurusan'

export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    console.log(">>> START seeding table: academic.jurusans")

    await Jurusan.createMany([
      {
        kode: 'MIPA',
        nama: 'IPA'
      },
      {
        kode: 'IPS',
        nama: 'IPS',
      },
      {
        kode: 'BHS',
        nama: 'BAHASA'
      }
    ])

    console.log(">>> DONE seeding table: academic.jurusans")
  }
}
