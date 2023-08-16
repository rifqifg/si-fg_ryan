import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Coa from '../../Models/Coa'
import { CoaTypes } from '../../lib/enums'

export default class extends BaseSeeder {
  public async run () {
    console.log(">>> START seeding table: finance.coas")

    const coasToCreate = [
      {
        id: "1000",
        name: "Kas",
        type: CoaTypes.ASSETS
      },
      {
        id: "1100",
        name: "Piutang Siswa",
        type: CoaTypes.ASSETS
      },
      {
        id: "1200",
        name: "Inventaris",
        type: CoaTypes.ASSETS
      },
      {
        id: "1300",
        name: "Peralatan",
        type: CoaTypes.ASSETS
      },
      {
        id: "2000",
        name: "Utang Supplier",
        type: CoaTypes.LIABILITIES
      },
      {
        id: "2100",
        name: "Utang Pendidikan",
        type: CoaTypes.LIABILITIES
      },
      {
        id: "3000",
        name: "Modal Awal",
        type: CoaTypes.EQUITY
      },
      {
        id: "3100",
        name: "Laba Ditahan",
        type: CoaTypes.EQUITY
      },
      {
        id: "4000",
        name: "Biaya Pendaftaran",
        type: CoaTypes.REVENUE
      },
      {
        id: "4100",
        name: "Biaya Kegiatan Ekstrakurikuler",
        type: CoaTypes.REVENUE
      },
      {
        id: "4200",
        name: "Pembayaran SPP",
        type: CoaTypes.REVENUE
      }
    ]    

    await Coa.updateOrCreateMany('id', coasToCreate)

    console.log(">>> DONE seeding table: finance.coas")
  }
}
