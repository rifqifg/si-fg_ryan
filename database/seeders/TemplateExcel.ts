import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import TemplateExcel from 'App/Models/TemplateExcel'

export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    console.log(">>> START seeding table: template_excels")

    await TemplateExcel.createMany([
      {
        id: "3c54a7c6-c953-41f3-99b8-d06723da3820",
        name: "Template Import Data Siswa",
        link: "https://docs.google.com/spreadsheets/d/1ZW7u7eYoLwfL5oMxXPw93Em1hORFxq-0/edit?usp=sharing&ouid=104153741308781838442&rtpof=true&sd=true",
        description: "Template untuk impor data siswa"
      }
    ])

    console.log(">>> DONE seeding table: template_excels")
  }
}
