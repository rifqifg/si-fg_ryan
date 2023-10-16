import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'academic.buku_nilais'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('aspek_penilaian', ['PENGETAHUAN', 'KETERAMPILAN', 'SIKAP'])
      table.uuid('semester_id').references('id').inTable('academic.semesters').onDelete('set null').onUpdate('cascade')
      table.integer('academic_year_id').references('id').inTable('academic.academic_years').onDelete('set null').onUpdate('cascade')
      table.enum('nilai_sikap', ['SB', 'B'])
      // table.enum('type', ['HARIAN', 'UTS', 'UAS', 'SIKAP']).alter()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
    table.dropColumns('aspek_penilaian', 'semester_id', 'nilai_sikap', 'academic_year_id')
    // table.enum('type', ['HARIAN', 'UTS', 'UAS']).alter()
    })
  }
}
