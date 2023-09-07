import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "rencana_pengambilan_nilais";

  public async up() {
    this.schema.withSchema("academic").alterTable(this.tableName, (table) => {
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
    });
  }

  public async down() {
    this.schema.withSchema('academic').alterTable(this.tableName, (table) => {
      table.dropColumns("subject_id", "teacher_id");
    });
  }
}
