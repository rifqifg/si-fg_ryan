import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import AssetLogType from 'Inventory/Models/AssetLogType';

export default class extends BaseSeeder {
  public async run() {
    console.log('>>> seeding Asset Log Type');
    await AssetLogType.createMany([
      { id: "AVAILABLE", description: "Asset tersedia" },
      { id: "RETURNED", description: "Asset dikembalikan dari peminjaman" },
      { id: "BORROWED", description: "Asset sedang dipinjam" },
      { id: "DEPLOYED", description: "Asset sudah dipasang" },
      { id: "MAINTENANCE", description: "Asset sedang dalam pemeliharaan" },
      { id: "DESTROYED", description: "Asset telah hancur baik disengaja / tidak" },
      { id: "SOLD", description: "Asset dijual" },
      { id: "RECEIVED", description: "Asset diterima dari pembelian" },
    ])
  }
}
