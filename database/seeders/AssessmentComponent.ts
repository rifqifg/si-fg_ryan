import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import AssessmentComponent from 'App/Models/AssessmentComponent'
import { AssessmentCategory } from 'App/lib/enum'

export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    console.log(">>> START seeding table: assessment_components")

    await AssessmentComponent.createMany([
      {
        id: 'ea2a94cf-df93-4e4e-9d0d-5470574b47a8',
        name: 'Efektifitas dan efisiensi kerja',
        category: AssessmentCategory.ASPEK_TEKNIS_PEKERJAAN
      },
      {
        id: 'af7f99b5-5039-4e8d-b7d6-cc86d63ea9e5',
        name: 'Ketepatan waktu dalam menyelesaikan tugas',
        category: AssessmentCategory.ASPEK_TEKNIS_PEKERJAAN
      },
      {
        id: '776aedf8-9926-45cc-880c-cb603c2f45ed',
        name: 'Kemampuan mencapai target',
        category: AssessmentCategory.ASPEK_TEKNIS_PEKERJAAN
      },
      {
        id: '298dec4e-2714-4521-93fd-5bb354042849',
        name: 'Tertib administrasi',
        category: AssessmentCategory.ASPEK_NON_TEKNIS
      },
      {
        id: '0c276a1d-e080-48bf-bf6e-6b0061f46bdc',
        name: 'Inisiatif',
        category: AssessmentCategory.ASPEK_NON_TEKNIS
      },
      {
        id: '35955322-fa98-458f-b9d0-69d663371f16',
        name: 'Kerjasama dan koordinasi antar bagian',
        category: AssessmentCategory.ASPEK_NON_TEKNIS
      },
      {
        id: 'ad0d71c3-abb9-4037-ab54-8a3f490c2db7',
        name: 'Prilaku',
        category: AssessmentCategory.ASPEK_KEPRIBADIAN
      },
      {
        id: 'ad0d71c3-abb9-4037-ab54-8a3f490c2db7',
        name: 'Kedisiplinan',
        category: AssessmentCategory.ASPEK_KEPRIBADIAN
      },
      {
        id: '0d8ff5d6-7b82-411e-96b3-8643a0b9ef9f',
        name: 'Tanggung jawab & Loyalitas',
        category: AssessmentCategory.ASPEK_KEPRIBADIAN
      },
      {
        id: '16e902e0-ef74-4fc6-9f45-3ba8b4225411',
        name: 'Koordinasi anggota',
        category: AssessmentCategory.ASPEK_KEPEMIMPINAN
      },
      {
        id: 'f4a9a103-6180-4cf4-a490-124f60fa57b0',
        name: 'Kontrol anggota',
        category: AssessmentCategory.ASPEK_KEPEMIMPINAN
      },
      {
        id: 'bfa9f60c-6493-4045-bd90-a8d8c2f9bb2a',
        name: 'Evaluasi dan Pembinaan anggota',
        category: AssessmentCategory.ASPEK_KEPEMIMPINAN
      },
      {
        id: '898e88eb-9fb9-4f5f-aa0f-a93feffb7d6c',
        name: 'Delegasi tanggung jawab dan wewenang',
        category: AssessmentCategory.ASPEK_KEPEMIMPINAN
      },
      {
        id: 'cbc746ba-56f9-43a1-aaba-935a8b91d3f2',
        name: 'Kecepatan dan Ketepatan Pengambilan Keputusan',
        category: AssessmentCategory.ASPEK_KEPEMIMPINAN
      },
    ])

    console.log(">>> DONE seeding table: assessment_components")
  }
}
