import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import TemplateExcel from 'App/Models/TemplateExcel'

export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    console.log(">>> START seeding table: template_excels")

    await TemplateExcel.fetchOrCreateMany('name', [
      {
        id: "3c54a7c6-c953-41f3-99b8-d06723da3820",
        name: "Template Import Data Siswa",
        link: "https://docs.google.com/spreadsheets/d/1ZW7u7eYoLwfL5oMxXPw93Em1hORFxq-0/export",
        description: "Template untuk impor data siswa"
      },
      {
        id: "7c110b95-5e6d-4c11-9b23-dc44ebef4a84",
        name: "Template Import Data Rekening Siswa",
        link: "https://docs.google.com/spreadsheets/d/1-DhiSLzVzCzm72blxToVB9MQKmwdd0L8qjYPmB5u6-U/export",
        description: "Template untuk impor data rekening siswa"
      },
      {
        id: "6f87a12c-9f94-41d3-a456-ae9c7e9efc7d",
        name: "Template Import Data Billing",
        link: "https://docs.google.com/spreadsheets/d/1VkfW5V0TqqlXf0Z-pW1y-uLgdBESrD86UtzcUHZe5sI/export",
        description: "Template untuk impor data billing"
      },
    ])

    console.log(">>> DONE seeding table: template_excels")
  }
}
