import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import KompetensiInti from '../../Models/KompetensiInti'

export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    console.log(">>> START seeding table: kompetensi_intis")

    await KompetensiInti.createMany([
      {
        id: 'ecea5a38-f402-4669-8438-32b455c85560',
        nama: 'Sikap Spiritual'
      },
      {
        id: 'e68ebd18-03bb-4475-bcc6-7fd61330beb1',
        nama: 'Sikap Sosial'
      },
      {
        id: 'c26321fa-64e7-4d62-842d-0c5356c42e86',
        nama: 'Pengetahuan'
      },
      {
        id: '2d06a8e3-5f60-4296-9869-c96ee0e644cd',
        nama: 'Ketrampilan'
      }
    ])
  
    console.log(">>> FINISH seeding table: kompetensi_intis")
  }
}
