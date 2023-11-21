import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Predikat from '../../Models/Predikat';

export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    console.log(">>> START seeding table: academic.predikats");

    await Predikat.createMany([
      {
        scoreMinimum: 0,
        scoreMaximum: 74,
        type: 'DESCRIPTION',
        category: 'PENGETAHUAN',
        description: 'Cukup baik, sudah memahami beberapa kompetensi dan masih harus lebih intensif menelaah materi'
      },
      {
        scoreMinimum: 75,
        scoreMaximum: 82,
        type: 'DESCRIPTION',
        category: 'PENGETAHUAN',
        description: 'Cukup baik, sudah memahami semua kompetensi yang diajarkan, tetapi masih perlu ditingkatkan'
      },
      {
        scoreMinimum: 83,
        scoreMaximum: 91,
        type: 'DESCRIPTION',
        category: 'PENGETAHUAN',
        description: 'Baik, sudah memahami semua kompetensi yang diajarkan'
      },
      {
        scoreMinimum: 92,
        scoreMaximum: 100,
        type: 'DESCRIPTION',
        category: 'PENGETAHUAN',
        description: 'Sangat baik, sudah memahami seluruh kompetensi yang diajarkan'
      },
      {
        scoreMinimum: 0,
        scoreMaximum: 74,
        type: 'DESCRIPTION',
        category: 'KETERAMPILAN',
        description: 'Cukup terampil, dalam mengimplementasikan kompetensi tetapi harus lebih banyak meningkatkan telaah materi'

      },
      {
        scoreMinimum: 75,
        scoreMaximum: 82,
        type: 'DESCRIPTION',
        category: 'KETERAMPILAN',
        description: 'Baik, sudah cukup terampil mengimplementasikan kompetensi'
      },
      {
        scoreMinimum: 83,
        scoreMaximum: 91,
        type: 'DESCRIPTION',
        category: 'KETERAMPILAN',
        description: 'Baik, terampil dalam mengimplementasikan dalam kehidupan sehari-hari'
      },
      {
        scoreMinimum: 92,
        scoreMaximum: 100,
        type: 'DESCRIPTION',
        category: 'KETERAMPILAN',
        description: 'Sangat terampil, dapat mengaplikasikan kompetensi ke dalam kehidupan sehari-hari'
      },
      {
        scoreSikap: 'C',
        type: 'DESCRIPTION',
        category: 'SIKAP',
        description: 'Cukup konsisten dalam menjalankan sikap beriman, bertaqwa, jujur, disiplin, dan bekerja sama, namun perlu peningkatan rasa percaya diri'
      },
      {
        scoreSikap: 'B',
        type: 'DESCRIPTION',
        category: 'SIKAP',
        description: 'Konsisten dalam menjalankan sikap beriman,bertaqwa, jujur, disiplin, bertanggung jawab dan kerja sama, namun perlu peningkatan rasa percaya diri'
      },
      {
        scoreSikap: 'SB',
        type: 'DESCRIPTION',
        category: 'SIKAP',
        description:  'Sudah sangat konsisten menunjukkan sikap beriman, bertaqwa, jujur, disiplin, bertanggung jawab, dan bekerja sama'
      },
      {
        scoreMinimum: 0,
        scoreMaximum: 74,
        type: 'PREDIKAT',
        description: 'D'
      },
      {
        scoreMinimum: 75,
        scoreMaximum: 82,
        type: 'PREDIKAT',
        description: 'C'
      },
      {
        scoreMinimum: 82.5,
        scoreMaximum: 91,
        type: 'PREDIKAT',
        description: 'B'
      },
      {
        scoreMinimum: 91.5,
        scoreMaximum: 100,
        type: 'PREDIKAT',
        description: 'A'
      }
  ])
    console.log(">>> DONE seeding table: academic.predikats");
  }
}
