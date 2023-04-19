import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

export default class StudentChartsController {
  public async siswaTingkat({ response }: HttpContextContract) {
    const selectTingkat = `
      select tingkat, count(id) total
      from(select split_part(c.name,' ',1) tingkat ,split_part(c.name,' ',2) jurusan,  s.id 
          from academic.students s
          left join academic.classes c 
            on c.id = s.class_id 
          where student_status = 'AKTIF'
          order by c.name
        ) x
      group by tingkat;
    `

    const selectJurusan = `
      select jurusan, count(id) total
      from(select split_part(c.name,' ',1) tingkat ,split_part(c.name,' ',2) jurusan,  s.id 
          from academic.students s
          left join academic.classes c 
            on c.id = s.class_id 
          where student_status = 'AKTIF'
          order by c.name
        ) x
      group by jurusan;
    `

    const selectTingkatJurusan = `
      select tingkat, jurusan, count(id) total
      from(select split_part(c.name,' ',1) tingkat ,split_part(c.name,' ',2) jurusan,  s.id 
          from academic.students s
          left join academic.classes c 
            on c.id = s.class_id 
          where student_status = 'AKTIF'
          order by c.name
        ) x
      group by tingkat, jurusan
      order by tingkat, jurusan;
    `
    const { rows: totalSiswa } = await Database.rawQuery(`select count(*) total from academic.students where student_status = 'AKTIF'`)
    const { rows: perTingkat } = await Database.rawQuery(selectTingkat)
    const { rows: perJurusan } = await Database.rawQuery(selectJurusan)
    const { rows: perTingkatJurusan } = await Database.rawQuery(selectTingkatJurusan)
    //TODO: yang boarding fullday belum ada

    response.ok({
      message: 'Berhasil mengambil data statistik siswa',
      totalSiswa: totalSiswa[0].total,
      perTingkat,
      perJurusan,
      perTingkatJurusan
    })
  }

  public async create({ }: HttpContextContract) { }

  public async store({ }: HttpContextContract) { }

  public async show({ }: HttpContextContract) { }

  public async edit({ }: HttpContextContract) { }

  public async update({ }: HttpContextContract) { }

  public async destroy({ }: HttpContextContract) { }
}
