import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import Application from "@ioc:Adonis/Core/Application";

export default class IndexSeeder extends BaseSeeder {
  private async runSeeder(seeder: { default: typeof BaseSeeder }) {
    /**
     * Do not run when not in dev mode and seeder is development
     * only
     */
    if (seeder.default.developmentOnly && !Application.inDev) {
      return;
    }

    await new seeder.default(this.client).run();
  }

  public async run() {
    // await this.runSeeder(await import('../Role'))
    // await this.runSeeder(await import('../Admin'))
    // await this.runSeeder(await import('../Module'))
    // await this.runSeeder(await import('../Menu'))
    // await this.runSeeder(await import('../Function'))
    // await this.runSeeder(await import('../Permission'))
    // await this.runSeeder(await import('../Permission'))
    // await this.runSeeder(await import('Inventory/Database/Seeders/AssetStatus'))
    // await this.runSeeder(await import('Inventory/Database/Seeders/AssetLogType'))
    // await this.runSeeder(await import('Inventory/Database/Seeders/CreateAsset'))
    // await this.runSeeder(await import('Academic/Database/Seeders/StudentsSeeder'))
    // await this.runSeeder(await import('Academic/Database/Seeders/StudentParentsSeeder'))
    // await this.runSeeder(await import('Academic/Database/Seeders/KompetensiInti'))
    // await this.runSeeder(await import('Academic/Database/Seeders/MetodePengambilanNilai'))
    // await this.runSeeder(await import('Academic/Database/Seeders/AcademicYearSeeder'))
    // await this.runSeeder(await import('Academic/Database/Seeders/SessionsSeeder'))
    // await this.runSeeder(await import("Academic/Database/Seeders/Semester"));
    // await this.runSeeder(await import('PPDB/Database/Seeders/PPDBSettingSeeder'))
    // await this.runSeeder(await import('PPDB/Database/Seeders/PPDBBatchesSeeder'))
    // await this.runSeeder(await import('PPDB/Database/Seeders/EntranceExamSchedulesSeeder'))
    // await this.runSeeder(await import('../TemplateExcel'))
    // await this.runSeeder(await import('Finance/Database/Seeder/MasterBillingSeeder'))
    // await this.runSeeder(await import('Finance/Database/Seeder/BillingSeeder'))
  }
}
