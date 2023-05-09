import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Asset from 'Inventory/Models/Asset';

export default class extends BaseSeeder {
  public async run() {
    console.log('>>> seeding Creating Asset Dummy');

    const newAsset: object[] = []
    for (let index = 0; index < 1000; index++) {
      newAsset.push({ assetStatusId: 'AVAILABLE', serial: 'DUMMY-X-' + index })
    }

    await Asset.createMany(newAsset)
  }
}
