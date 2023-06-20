import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import MetodePengambilanNilai from '../../Models/MetodePengambilanNilai'

export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    console.log(">>> START seeding table: metode_pengambilan_nilais")

    await MetodePengambilanNilai.createMany([
      {
        id: 'c105a76e-f94e-43b8-ab3d-ea8b320830a6',
        nama: 'ulangan'
      },
      {
        id: '610e7336-9e5d-47d8-aa59-e2d1b8d3c89e',
        nama: 'diskusi'
      },
      {
        id: 'f6c27d32-e329-4752-8f72-4c9560661e84',
        nama: 'tugas'
      },
      {
        id: '3397d52a-127f-4cb1-912c-be98ba76c797',
        nama: 'praktik'
      },
      {
        id: 'aa5e516f-b238-4ac8-ae4d-4ed5b4c4b08a',
        nama: 'project'
      }
    ])

    console.log(">>> FINISH seeding table: metode_pengambilan_nilais")
  }
}
