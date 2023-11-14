import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'predikats'

  public async up () {
    this.schema.withSchema('academic').createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().defaultTo(this.raw("gen_random_uuid()"))
      table.integer('score_minimum')
      table.integer('score_maximum')
      table.string('score_sikap')
      table.enum('type', ['PREDIKAT', 'DESCRIPTION'], {
        useNative: true,
        enumName: 'PREDIKAT_TYPE',
        schemaName: 'academic'
      })
      table.enum('category', ['PENGETAHUAN', 'KETERAMPILAN', 'SIKAP'], {
        useNative: true,
        enumName: 'CATEGORY_PREDIKAT',
        schemaName: 'academic'
      })
      table.string('description')


      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.withSchema('academic').dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS academic."CATEGORY_PREDIKAT"')
    this.schema.raw('DROP TYPE IF EXISTS academic."PREDIKAT_TYPE"')
  }
}
