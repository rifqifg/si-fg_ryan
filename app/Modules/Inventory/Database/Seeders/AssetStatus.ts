import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import AssetStatus from '../../Models/AssetStatus';

export default class extends BaseSeeder {
  public async run() {
    console.log('>>> seeding Asset Status');
    await AssetStatus.createMany([
      { name: "AVAILABLE", type: 'DEPLOYABLE', color: '#85A4E4', notes: "Asset tersedia" },
      { name: "BORROWED", type: 'PENDING', color: '#235C29', notes: "Asset sedang dipinjam" },
      { name: "DEPLOYED", type: 'ARCHIVED', color: '#C29C12', notes: "Asset sudah dipasang" },
      { name: "MAINTENANCE", type: 'PENDING', color: '#EA93C5', notes: "Asset sedang dalam pemeliharaan" },
      { name: "DESTROYED", type: 'ARCHIVED', color: '#11E5DC', notes: "Asset telah hancur baik disengaja / tidak" },
      { name: "SOLD", type: 'ARCHIVED', color: '#C16F4B', notes: "Asset dijual" }
    ])
  }
}
