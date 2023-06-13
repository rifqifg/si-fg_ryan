import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "rencana_pengambilan_nilais";

  public async up() {
    this.schema
    .withSchema('academic').createTable(this.tableName, (table) => {
      table.uuid('id').notNullable().unique().primary()
      table
        .uuid("program_semester_detail_id")
        .references("id")
        .inTable("academic.program_semester_details")
        .onDelete("set null")
        .onUpdate("cascade");
      table
        .uuid("metode_pengambilan_nilai_id")
        .references("id")
        .inTable("academic.metode_pengambilan_nilais")
        .onDelete("set null")
        .onUpdate("cascade");
      table
        .uuid("subject_id")
        .references("id")
        .inTable("academic.subjects")
        .onDelete("set null")
        .onUpdate("cascade");
      table
        .uuid("teacher_id")
        .references("id")
        .inTable("academic.teachers")
        .onDelete("set null")
        .onUpdate("cascade");
      table.string("topik");
      table.float("presentase");
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
